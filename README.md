# Lili Teixeira — Body Piercer | POO V14 e fotos por cor

Site original preservado visualmente. A V14 mantém a arquitetura POO e permite cadastrar uma foto dourada e outra prateada por produto. Os endereços das páginas e as joias existentes são preservados. O painel acrescenta somente duas colunas opcionais ao banco de dados.

## Arquitetura

- `assets/js/main.js` — entrada única do JavaScript.
- `assets/js/core/SiteApp.js` — inicializa uma vez o carregamento, o catálogo, os componentes e os efeitos.
- `assets/js/components/` — menu, carrossel, filtros, modal, interações, imagens e navegação, com `ProductVariants.js` para trocar cores.
- `assets/js/services/` — catálogo público e centralização das mensagens do WhatsApp.
- `assets/js/effects/EffectsApp.js` — animações e observação de entrada no viewport.
- `assets/js/utils/TextSearch.js` — normalização de pesquisas compartilhada entre páginas.
- `app/src/Database.php` — PDO e configuração.
- `app/src/ProductRepository.php` — consultas e alterações SQL dos produtos, incluindo fotos opcionais por cor e migração autenticada.
- `app/src/ProductAdminController.php` — validação e ações do formulário.
- `app/src/ProductImageStorage.php` — upload e limpeza segura de arquivos.
- `app/src/AdminSession.php` — sessão, CSRF, autenticação e mensagens.
- `app/src/AdminUserRepository.php` — consultas a administradores.
- `app/bootstrap.php` — carregamento de classes e compatibilidade de templates.
- `admin/admin.js` — pesquisa administrativa em classe.

## Duplicações corrigidas

- O preloader era inicializado em `main.js` e novamente em `SiteApp`: agora inicia uma vez.
- `RevealOnScroll` e `EffectsApp.initReveal()` observavam os mesmos elementos: há apenas um controlador de revelação, com fallback para movimento reduzido.
- Textos iguais de intenção de compra eram mantidos no modal e nos botões: centralizados em `WhatsAppService`.
- A busca administrativa e a do catálogo repetiam a normalização de acentos: ambas usam `TextSearch`.
- Consultas SQL dos produtos saíram da API e da página do painel e agora usam `ProductRepository`.

## URLs preservadas

- Site: `/`
- Produtos: `/produtos.html`
- Área administrativa: `/admin/login.php` e `/admin/index.php`
- API pública: `/api/products.php`

## Publicação na Hostinger

Leia `INSTALACAO_HOSTINGER.md` e `ALTERACOES_V14_DUAS_CORES.md` antes de atualizar a instalação. **Não substitua nem apague o arquivo `api/config.local.php`, o banco MySQL ou `uploads/products/` do servidor.** Eles não são incluídos nestes pacotes. Todos os arquivos extraídos devem ficar diretamente em `public_html/`, e não em uma subpasta adicional.

Requisitos: PHP 8.1+ com extensões PDO e PDO MySQL; servidor Apache/Hostinger e banco MySQL atual.

**Esta é uma atualização de uma instalação existente.** O painel tenta adicionar automaticamente as colunas opcionais `image_gold_path` e `image_silver_path` no primeiro acesso autenticado. Se não houver permissão ALTER TABLE, execute o SQL em `database/upgrade_v14_cores.sql` no phpMyAdmin, somente quando as duas colunas estiverem ausentes. Nenhum dado atual é excluído.


## V15 — Chatbot de atendimento (POO)

- Botão flutuante nas páginas `index.html` e `produtos.html`, com perguntas sugeridas, respostas no painel e atalho para WhatsApp.
- `assets/js/components/Chatbot.js` cria a interface de modo acessível e protege contra HTML remoto usando `textContent`.
- `api/chat.php` usa as classes de `app/src/Chat*.php` e aplica validação, bloqueio de origem e limitação de requisições.
- Sem chave de API: modo FAQ automático identificado corretamente; com chave: modelo de IA via Responses API.
- O catálogo público ativo do MySQL pode ser incluído no contexto, sem expor informações administrativas.
- **Ativação da IA:** leia `CHATBOT_IA_INSTALACAO.md`. Não adicione chave em HTML/JS ou em repositório.
- Não é necessário atualizar o banco de dados por causa do chatbot.
