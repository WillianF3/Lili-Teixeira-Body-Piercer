# Referências usadas no projeto — V15

Consultadas em 03/11/2026:

1. **OpenAI — Text generation / Responses API**: https://developers.openai.com/api/docs/guides/text
   - API de texto, instruções ao modelo e estrutura de respostas.
2. **OpenAI — Production best practices**: https://developers.openai.com/api/docs/guides/production-best-practices
   - Segredo da API apenas no servidor; proteção e rotação de chaves.
3. **OWASP — LLM01 Prompt Injection**: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
   - Validar entrada, limitar poderes do modelo e tratar dados externos como não confiáveis.
4. **OWASP — LLM02 Sensitive Information Disclosure**: https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/
   - Limitar dados pessoais e evitar exposição de segredos.
5. **W3C WAI — WAI-ARIA**: https://www.w3.org/WAI/standards-guidelines/aria/
   - Rótulos acessíveis, teclado e regiões de atualização para tecnologias assistivas.

## Decisões de implementação

- UI amigável e responsiva no site, sem serviço de widget terceirizado obrigatório.
- PHP exclusivo para integração de API, evitando chave em JavaScript.
- Base de respostas verificadas no próprio site; IA não pode prometer horários ou valores de procedimentos.
- Fallback transparente com respostas predefinidas se não houver chave ou se a API falhar.
- Encaminhamento direto ao WhatsApp para fechar atendimento com a profissional.
