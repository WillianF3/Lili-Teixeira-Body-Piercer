<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#FAF8F5">
<title><?= h($pageTitle ?? 'Administração') ?> | Lili Teixeira</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/admin/admin.css?v=12">
</head>
<body>
<header class="admin-header">
  <div class="header-inner">
    <a href="/" class="brand" aria-label="Lili Teixeira — voltar ao site"><img src="/images/logo-header.png" alt="Lili Teixeira Body Piercing" width="800" height="400"><span class="brand-context">ÁREA ADMINISTRATIVA</span></a>
    <nav class="admin-nav" aria-label="Navegação administrativa">
      <?php if (admin_authenticated()): ?>
        <a class="nav-panel" href="/admin/index.php" <?= ($pageTitle ?? '') === 'Produtos' ? 'aria-current="page"' : '' ?>>Painel</a>
        <a href="/admin/index.php#form-product">Adicionar joia</a>
      <?php endif; ?>
      <a href="/produtos.html" target="_blank" rel="noopener noreferrer">Catálogo <span aria-hidden="true">↗</span></a>
      <a class="nav-site" href="/" target="_blank" rel="noopener noreferrer">Ver site <span aria-hidden="true">↗</span></a>
      <?php if (admin_authenticated()): ?>
        <form method="post" action="/admin/logout.php"><input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>"><button type="submit" class="logout">Sair</button></form>
      <?php endif; ?>
    </nav>
  </div>
</header>
