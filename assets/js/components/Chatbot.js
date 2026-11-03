/** Widget POO independente do catálogo. Todo texto remoto é exibido com textContent. */
export class Chatbot {
  constructor() {
    this.history = [];
    this.busy = false;
    this.opened = false;
    this.whatsapp = 'https://wa.me/5547997560445?text=' + encodeURIComponent('Olá, Lili! Tenho uma dúvida sobre os serviços e joias do site.');
    this.suggestions = [
      'Como faço para agendar?',
      'Onde fica o estúdio?',
      'Quais joias vocês têm?',
      'Como cuidar da perfuração?'
    ];
  }

  init() {
    if (document.getElementById('lili-chatbot')) return;
    const section = document.createElement('section');
    section.id = 'lili-chatbot';
    section.className = 'lili-chat';
    section.setAttribute('aria-label', 'Atendimento virtual Lili Body Piercer');
    section.innerHTML = `
      <button type="button" class="lili-chat__launcher" aria-controls="lili-chat-panel" aria-expanded="false" aria-label="Abrir atendimento virtual">
        <i class="fa-regular fa-comments" aria-hidden="true"></i><span>Tire suas dúvidas</span>
      </button>
      <div class="lili-chat__panel" id="lili-chat-panel" role="region" aria-label="Conversa com assistente virtual" hidden>
        <div class="lili-chat__header">
          <span class="lili-chat__avatar" aria-hidden="true"><i class="fa-solid fa-gem"></i></span>
          <span class="lili-chat__heading"><strong>Lili • Assistente virtual</strong><small class="lili-chat__mode">Atendimento automático</small></span>
          <button type="button" class="lili-chat__close" aria-label="Fechar atendimento"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="lili-chat__messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Mensagens da conversa"></div>
        <div class="lili-chat__suggestions" aria-label="Sugestões de perguntas"></div>
        <div class="lili-chat__footer">
          <form class="lili-chat__form">
            <label class="lili-chat__label" for="lili-chat-input">Sua pergunta</label>
            <input id="lili-chat-input" class="lili-chat__input" type="text" maxlength="500" autocomplete="off" placeholder="Digite sua dúvida..." required>
            <button type="submit" class="lili-chat__send" aria-label="Enviar pergunta"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>
          </form>
          <div class="lili-chat__fineprint">Respostas automáticas podem falhar. Não compartilhe dados pessoais.</div>
          <a class="lili-chat__whatsapp" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Falar com a Lili no WhatsApp</a>
        </div>
      </div>`;
    document.body.append(section);
    this.root = section;
    this.launcher = section.querySelector('.lili-chat__launcher');
    this.panel = section.querySelector('.lili-chat__panel');
    this.messages = section.querySelector('.lili-chat__messages');
    this.suggestionArea = section.querySelector('.lili-chat__suggestions');
    this.form = section.querySelector('.lili-chat__form');
    this.input = section.querySelector('.lili-chat__input');
    this.sendButton = section.querySelector('.lili-chat__send');
    this.mode = section.querySelector('.lili-chat__mode');
    section.querySelector('.lili-chat__whatsapp').href = this.whatsapp;
    this.launcher.addEventListener('click', () => this.toggle());
    section.querySelector('.lili-chat__close').addEventListener('click', () => this.toggle(false));
    this.form.addEventListener('submit', event => { event.preventDefault(); this.send(this.input.value); });
    section.addEventListener('keydown', event => { if (event.key === 'Escape' && this.opened) this.toggle(false); });
    this.addMessage('Olá! Sou a assistente virtual da Lili. ✨ Posso ajudar com agendamentos, joias, localização e dúvidas gerais. Por onde começamos?', 'assistant');
    this.renderSuggestions();
  }

  toggle(value = !this.opened) {
    this.opened = value;
    this.panel.hidden = !value;
    this.launcher.setAttribute('aria-expanded', String(value));
    this.launcher.setAttribute('aria-label', value ? 'Atendimento aberto' : 'Abrir atendimento virtual');
    this.root.classList.toggle('is-open', value);
    if (value) this.input.focus();
    else this.launcher.focus();
  }

  addMessage(text, role, pending = false) {
    const bubble = document.createElement('div');
    bubble.className = 'lili-chat__message lili-chat__message--' + role + (pending ? ' is-pending' : '');
    bubble.textContent = text;
    this.messages.append(bubble);
    this.messages.scrollTop = this.messages.scrollHeight;
    return bubble;
  }

  renderSuggestions() {
    this.suggestionArea.replaceChildren();
    if (this.history.length > 2) return;
    for (const text of this.suggestions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lili-chat__chip';
      button.textContent = text;
      button.disabled = this.busy;
      button.addEventListener('click', () => this.send(text));
      this.suggestionArea.append(button);
    }
  }

  async send(rawText) {
    const message = String(rawText || '').trim();
    if (this.busy || !message) return;
    this.busy = true;
    this.input.value = '';
    this.input.disabled = true;
    this.sendButton.disabled = true;
    this.suggestionArea.querySelectorAll('button').forEach(button => { button.disabled = true; });
    this.addMessage(message, 'user');
    const pending = this.addMessage('Escrevendo resposta…', 'assistant', true);
    const previous = this.history.slice(-8);
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 23000);
    try {
      const response = await fetch('api/chat.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        cache: 'no-store',
        signal: abort.signal,
        body: JSON.stringify({message, history: previous}),
      });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== 'string') throw new Error(data.error || 'Atendimento indisponível.');
      pending.textContent = data.answer;
      pending.classList.remove('is-pending');
      const modes = {ai: 'Respostas com IA', faq: 'Respostas automáticas', fallback: 'Atendimento básico • IA indisponível'};
      this.mode.textContent = modes[data.mode] || 'Atendimento virtual';
      this.history.push({role: 'user', content: message}, {role: 'assistant', content: data.answer});
      this.history = this.history.slice(-8);
    } catch (error) {
      pending.textContent = error.name === 'AbortError'
        ? 'A resposta demorou mais que o esperado. Fale diretamente com a Lili no WhatsApp.'
        : (error.message && error.message.length < 200 ? error.message : 'Não consegui responder agora. Use o WhatsApp para falar com a Lili.');
      pending.classList.remove('is-pending');
    } finally {
      clearTimeout(timeout);
      this.busy = false;
      this.input.disabled = false;
      this.sendButton.disabled = false;
      this.renderSuggestions();
      this.messages.scrollTop = this.messages.scrollHeight;
      if (this.opened) this.input.focus();
    }
  }
}
