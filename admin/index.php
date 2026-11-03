<?php
declare(strict_types=1);
require_once __DIR__ . '/../app/bootstrap.php';

use Lili\App\ProductRepository;
use Lili\App\ProductImageStorage;
use Lili\App\ProductAdminController;

admin_require_auth();
$error = '';
$repository = null;
try {
    $repository = new ProductRepository(db());
    try {
        $repository->ensureColorColumns();
    } catch (Throwable $upgradeError) {
        error_log('Database color image upgrade: ' . $upgradeError->getMessage());
        $error = 'Não foi possível ativar as fotos por cor automaticamente. É necessário aplicar database/upgrade_v14_cores.sql no phpMyAdmin e atualizar esta página.';
    }
} catch (Throwable $ex) {
    error_log('Admin dashboard db: ' . $ex->getMessage());
    $error = 'Não foi possível conectar ao banco. Confira a configuração.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $repository) {
    csrf_check();
    try {
        $controller = new ProductAdminController($repository, new ProductImageStorage());
        set_flash($controller->handle($_POST, $_FILES));
        admin_redirect();
    } catch (RuntimeException $ex) {
        $error = $ex->getMessage();
    } catch (Throwable $ex) {
        error_log('Admin action: ' . $ex->getMessage());
        $error = 'Erro ao salvar. Verifique os dados e tente novamente.';
    }
}

$rows = [];
$editing = null;
if ($repository) {
    try {
        $rows = $repository->all();
        if (isset($_GET['edit'])) {
            $id = filter_var($_GET['edit'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            foreach ($rows as $row) {
                if ((int)$row['id'] === $id) { $editing = $row; break; }
            }
            if (!$editing) $error = 'O produto solicitado não existe.';
        }
    } catch (Throwable $ex) {
        error_log('Admin list: ' . $ex->getMessage());
        $error = 'Não foi possível carregar os produtos.';
    }
}
$total = count($rows);
$active = count(array_filter($rows, fn($p) => (int)$p['active'] === 1));
$featured = count(array_filter($rows, fn($p) => (int)$p['active'] === 1 && (int)$p['featured'] === 1));
$flash = get_flash();
$pageTitle = 'Produtos';
require __DIR__ . '/parts/header.php';
?>
<main class="dashboard">
  <section class="dashboard-hero" aria-labelledby="hero-title">
    <div class="hero-visual" aria-hidden="true"></div>
    <div class="hero-content">
      <div class="hero-kicker"><span class="kicker-line"></span> LILI TEIXEIRA · GESTÃO DA COLEÇÃO</div>
      <h1 id="hero-title">Sua coleção,<br><em>em boas mãos.</em></h1>
      <p>Gerencie suas joias, atualize informações e destaque o que faz sua marca brilhar.</p>
      <div class="hero-actions">
        <a class="button primary hero-cta" href="#form-product">+ Adicionar joia</a>
        <a class="button hero-outline" href="/produtos.html" target="_blank" rel="noopener noreferrer">Ver catálogo <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <span class="hero-decoration" aria-hidden="true">✦</span>
  </section>
  <?php if ($flash): ?><div class="alert <?= !empty($flash['error']) ? 'error' : 'success' ?>" role="status"><?= h($flash['message']) ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert error" role="alert"><?= h($error) ?></div><?php endif; ?>
  <section class="stats" aria-label="Resumo do catálogo">
     <div class="stat"><div class="stat-head"><small>JOIAS CADASTRADAS</small><span aria-hidden="true">◇</span></div><strong><?= $total ?></strong><span class="stat-caption">Itens da coleção</span></div>
     <div class="stat"><div class="stat-head"><small>JOIAS VISÍVEIS</small><span aria-hidden="true">✧</span></div><strong><?= $active ?></strong><span class="stat-caption">Disponíveis no catálogo</span></div>
     <div class="stat"><div class="stat-head"><small>EM DESTAQUE</small><span aria-hidden="true">✦</span></div><strong><?= $featured ?></strong><span class="stat-caption">Exibidas na página inicial</span></div>
  </section>
  <div class="columns">
    <section class="panel form-panel" id="form-product">
      <div class="panel-heading"><div><div class="eyebrow">CURADORIA DA COLEÇÃO</div><h2><?= $editing ? 'Editar joia' : 'Adicionar joia' ?></h2></div><?php if ($editing): ?><a href="/admin/index.php#form-product" class="subtle-link">Cancelar edição</a><?php endif; ?></div>
      <form method="post" enctype="multipart/form-data" class="product-form">
        <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>"><input type="hidden" name="action" value="save"><input type="hidden" name="id" value="<?= h($editing['id'] ?? 0) ?>">
        <label>Nome do produto <input name="name" required maxlength="160" value="<?= h($editing['name'] ?? '') ?>" placeholder="Ex.: Piercing de zircônia"></label>
        <label>Descrição <textarea name="description" rows="4" maxlength="2500" placeholder="Descreva os detalhes, material e acabamento..."><?= h($editing['description'] ?? '') ?></textarea></label>
        <div class="two-cols">
          <label>Categoria <select name="category" required>
            <?php foreach (['labret'=>'Labret', 'argola'=>'Argolas', 'especial'=>'Especiais', 'cluster'=>'Clúster'] as $key => $name): ?><option value="<?= h($key) ?>" <?= ($editing['category'] ?? '') === $key ? 'selected' : '' ?>><?= h($name) ?></option><?php endforeach; ?>
          </select></label>
          <label>Preço (R$) <input name="price" inputmode="decimal" required value="<?= h(isset($editing['price']) ? number_format((float)$editing['price'], 2, ',', '') : '') ?>" placeholder="107,00"></label>
        </div>
        <div class="two-cols">
          <label>Estoque <input name="stock_quantity" type="number" min="0" max="1000000" value="<?= h($editing['stock_quantity'] ?? '') ?>" placeholder="Sem controle"></label>
          <label>Ordem de exibição <input name="sort_order" type="number" min="0" max="100000" value="<?= h($editing['sort_order'] ?? 100) ?>"></label>
        </div>
        <label>Etiqueta (opcional) <input name="badge" maxlength="45" value="<?= h($editing['badge'] ?? '') ?>" placeholder="NOVO, MAIS VENDIDO..."></label>
        <div class="photo-variants" role="group" aria-label="Fotos do produto por cor">
          <div class="variant-heading"><strong>Fotos do produto</strong><p>Adicione uma foto para cada acabamento. Se houver duas cores, o cliente poderá alternar entre as imagens no catálogo.</p></div>
          <?php foreach ([
            ['photo_gold', 'image_gold_path', 'remove_photo_gold', 'Dourado', 'Foto da versão dourada'],
            ['photo_silver', 'image_silver_path', 'remove_photo_silver', 'Prateado', 'Foto da versão prateada'],
          ] as [$field, $pathField, $removeField, $labelText, $placeholder]): ?>
          <div class="variant-image-field">
            <label><?= h($placeholder) ?> <input name="<?= h($field) ?>" type="file" accept="image/jpeg,image/png,image/webp" data-preview-target="preview-<?= h($field) ?>"></label>
            <div class="variant-preview" id="preview-<?= h($field) ?>">
              <?php if (!empty($editing[$pathField])): ?><img src="/<?= h($editing[$pathField]) ?>" alt="Foto cadastrada da versão <?= h(strtolower($labelText)) ?>"><?php else: ?><span>Nenhuma foto cadastrada</span><?php endif; ?>
            </div>
            <?php if (!empty($editing[$pathField])): ?><label class="check"><input type="checkbox" name="<?= h($removeField) ?>" value="1"> Remover foto <?= h(strtolower($labelText)) ?></label><?php endif; ?>
          </div>
          <?php endforeach; ?>
        </div>
        <details class="general-photo"><summary>Foto principal (opcional, para produtos de uma cor)</summary>
          <p class="helper">A imagem principal continua disponível para as joias cadastradas anteriormente. Para produtos com duas cores, prefira as duas fotos acima.</p>
          <label>Foto principal (JPG, PNG ou WebP, até 4 MB) <input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label>
          <?php if (!empty($editing['image_path'])): ?><div class="existing-photo"><img src="/<?= h($editing['image_path']) ?>" alt="Foto principal atual"><label class="check"><input type="checkbox" name="remove_photo" value="1"> Remover foto principal</label></div><?php endif; ?>
        </details>
        <div class="checks"><label class="check"><input name="active" type="checkbox" value="1" <?= !$editing || (int)$editing['active'] === 1 ? 'checked' : '' ?>> Produto visível na loja</label>
        <label class="check"><input name="featured" type="checkbox" value="1" <?= !empty($editing['featured']) ? 'checked' : '' ?>> Destacar na página inicial</label></div>
        <button type="submit" class="button primary" <?= !$repository ? 'disabled' : '' ?>><?= $editing ? 'Salvar alterações' : 'Cadastrar produto' ?></button>
        <p class="helper">As alterações ficam disponíveis no catálogo público assim que forem salvas.</p>
      </form>
    </section>
    <section class="panel list-panel"><div class="panel-heading"><div><div class="eyebrow">CATÁLOGO ATUAL</div><h2>Suas joias</h2></div><span class="count"><?= $total ?> itens</span></div>
      <label class="search-label">Buscar joia pelo nome <input type="search" id="productSearch" placeholder="Pesquise entre suas joias..." aria-controls="productList"></label>
      <p class="search-count" id="searchCount" aria-live="polite"></p>
      <?php if (!$rows): ?><p class="empty">Nenhum produto cadastrado. Utilize o formulário para adicionar o primeiro.</p><?php endif; ?>
      <div class="product-list" id="productList">
      <?php foreach ($rows as $row): ?>
        <article class="admin-product" data-search="<?= h(strtolower($row['name'])) ?>">
          <div class="thumb"><?php if ($row['image_path'] || $row['image_gold_path'] || $row['image_silver_path']): ?><img src="/<?= h($row['image_gold_path'] ?: $row['image_silver_path'] ?: $row['image_path']) ?>" loading="lazy" alt=""><?php else: ?><span>◇</span><?php endif; ?></div>
          <div class="item-info"><strong><?= h($row['name']) ?></strong><small><?= h(ucfirst($row['category'])) ?> · R$ <?= h(number_format((float)$row['price'], 2, ',', '.')) ?></small>
          <div class="chips"><?php if (!empty($row['image_gold_path'])): ?><span class="chip">Dourado</span><?php endif; ?><?php if (!empty($row['image_silver_path'])): ?><span class="chip">Prateado</span><?php endif; ?><span class="chip <?= $row['active'] ? 'on' : 'off' ?>"><?= $row['active'] ? 'Ativo' : 'Oculto' ?></span><?php if ($row['featured']): ?><span class="chip">Destaque</span><?php endif; ?><?php if ($row['stock_quantity'] !== null): ?><span class="chip <?= (int)$row['stock_quantity'] === 0 ? 'off' : '' ?>">Estoque: <?= h($row['stock_quantity']) ?></span><?php endif; ?></div></div>
          <div class="item-actions"><a class="edit-link" href="?edit=<?= (int)$row['id'] ?>#form-product">Editar</a><form method="post" onsubmit="return confirm('Excluir este produto permanentemente?')"><input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$row['id'] ?>"><button type="submit" class="delete-link">Excluir</button></form></div>
        </article>
      <?php endforeach; ?>
      </div>
      <?php if ($rows): ?><p class="search-empty" id="searchEmpty" hidden>Nenhuma joia encontrada para essa busca.</p><?php endif; ?>
    </section>
  </div>
</main>
<script type="module" src="/admin/admin.js?v=14"></script>
<?php require __DIR__ . '/parts/footer.php'; ?>
