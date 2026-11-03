# V14 — Imagens independentes por cor

- Dois uploads JPG, PNG ou WebP (dourado/prateado), cada um com prévia e opção de remoção.
- Imagem principal legada preservada. Produtos antigos não precisam de recadastro.
- Seletor de cor responsivo nos cards e no modal; compra por WhatsApp inclui a escolha.
- Persistência POO com duas colunas opcionais em `products`, adicionadas no primeiro acesso autenticado ao painel quando o banco permite.
- SQL manual de contingência em `database/upgrade_v14_cores.sql`.
- Proteção de imagens antigas e credenciais; migração sem excluir dados.

# V13 — Refatoração POO

- Entrada JS única e carregamento ordenado do catálogo antes da criação dos controladores.
- Corrigida a inicialização duplicada do preloader e a duplicidade da animação de revelação.
- Mensagem de WhatsApp de compra em um único serviço.
- Filtro administrativo orientado a objetos e busca acentuada compartilhada.
- Classes PHP para conexão, sessão, usuários, catálogo, validação, imagens e CRUD.
- API e painel passam a reutilizar a mesma camada de produtos.
- `api/config.local.php` e fotos enviadas por usuários **excluídos** dos ZIPs de entrega.
- Sem alterações na estrutura do banco, CSS de layout ou conteúdo visual.
