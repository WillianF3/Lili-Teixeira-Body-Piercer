# Chatbot V15 — Ativação na Hostinger

## Antes de publicar

1. Faça backup dos arquivos do site e do banco de dados.
2. Use o ZIP **Atualizacao** e envie ao diretório `public_html` da Hostinger; extraia preservando as pastas.
3. **Não apague nem substitua** `api/config.local.php` existente. O ZIP não inclui esse arquivo e não inclui credenciais.
4. Abra a página inicial e a página de produtos, clique em “Tire suas dúvidas” e faça uma pergunta sobre endereço ou agendamento. Sem chave de API, o painel informa **Respostas automáticas** (modo FAQ).

## Ativar respostas reais por IA

O chatbot usa a OpenAI Responses API. É necessário possuir uma chave válida da plataforma OpenAI e uma conta com faturamento de API habilitado — a API pode gerar custos por uso. **Nunca exponha a chave nos arquivos HTML, CSS ou JavaScript.**

**Opção A (preferida):** configure `OPENAI_API_KEY` como variável de ambiente segura no servidor, caso a hospedagem permita.

**Opção B (Hostinger PHP compartilhado):** edite o arquivo privado já existente `public_html/api/config.local.php`, mantenha todos os dados de MySQL e acrescente **dentro do array** retornado por `return [...]`:

```php
'openai_api_key' => 'COLE_SUA_CHAVE_PRIVADA_AQUI',
'chatbot_model' => 'gpt-5.4-mini',
```

Exemplo parcial: se já existe `return ['host' => ..., 'setup_key' => ...];`, adicione as duas linhas como novos campos dentro dos colchetes; não crie um segundo `return`.

O servidor precisa permitir HTTPS de saída e possuir a extensão PHP cURL. Se a API não estiver configurada ou falhar, o visitante continua recebendo respostas simples, e o cabeçalho identifica o atendimento básico.

## Segurança e privacidade

- A chamada de IA ocorre em PHP; a chave não é enviada ao navegador.
- Limitação por IP: até 18 envios em 10 minutos e 55 por hora (armazenamento temporário no servidor).
- Somente textos curtos, sem comandos administrativos, sem envio de arquivos e sem executar ações pelo modelo.
- Conversas são enviadas ao provedor de IA quando o modo IA está ativo. Evite incluir dados pessoais ou de saúde.
- A requisição usa `store:false`; o site não grava histórico das conversas no banco.
- Agendamento, procedimento e disponibilidade devem ser confirmados no WhatsApp.
- Para alterar perguntas e respostas básicas, edite `app/src/ChatKnowledgeBase.php`.
- O catálogo mostrado à IA é obtido dos produtos públicos ativos, quando o banco está disponível; o texto do catálogo não autoriza instruções para o modelo.

## Testes após publicar

1. Em `index.html` e `produtos.html`, clique no botão **Tire suas dúvidas**.
2. Pergunte **Onde fica?** e **Como agendar?**: a mensagem deve trazer o endereço e o encaminhamento ao WhatsApp.
3. Pressione `Esc` ou o botão `X` para fechar. Verifique no celular o teclado e a rolagem das mensagens.
4. Se a chave estiver configurada, faça uma pergunta diferente sobre joias: o rótulo muda para **Respostas com IA**.
5. Em caso de erro, verifique se o PHP possui cURL, se a chave é válida e se seu projeto de API permite o modelo escolhido. O navegador não deve exibir mensagens técnicas internas.

Este pacote não cria agendamentos, não consulta agenda privada e não substitui atendimento médico/profissional.
