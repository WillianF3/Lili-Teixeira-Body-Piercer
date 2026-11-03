<?php
declare(strict_types=1);
require_once __DIR__ . '/../app/bootstrap.php';

use Lili\App\AdminUserRepository;
admin_session();
$error = '';
$installed = false;
try { $installed = (new AdminUserRepository(db()))->hasAny(); }
catch (Throwable $exception) { error_log('Admin setup: ' . $exception->getMessage()); $error = 'Banco não configurado. Crie o banco, importe database/install.sql e configure api/config.local.php.'; }
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$installed && !$error) {
    csrf_check();
    $name = trim((string)($_POST['name'] ?? ''));
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $password = (string)($_POST['password'] ?? '');
    $key = (string)($_POST['setup_key'] ?? '');
    $actual = (string)(app_config()['setup_key'] ?? '');
    if (!$actual || $actual === 'ALTERE_PARA_UMA_CHAVE_LONGA_ALEATORIA' || !hash_equals($actual, $key)) {
        $error = 'Chave de instalação inválida.';
    } elseif (strlen($name) < 2 || strlen($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        $error = 'Informe nome e e-mail válidos.';
    } elseif (strlen($password) < 12 || strlen($password) > 128) {
        $error = 'A senha deve ter entre 12 e 128 caracteres.';
    } else {
        try {
            (new AdminUserRepository(db()))->create($name, $email, $password);
            $installed = true;
            set_flash('Administrador criado. Faça login.');
            admin_redirect('/admin/login.php');
        } catch (Throwable $ex) { error_log('Admin setup insert: ' . $ex->getMessage()); $error = 'Não foi possível criar o administrador. Confira o banco de dados.'; }
    }
}
$pageTitle = 'Instalação';
require __DIR__ . '/parts/header.php';
?>
<main class="login-wrap"><div class="auth-layout">
<aside class="auth-art" aria-label="Identidade visual Lili Teixeira">
  <div class="auth-art-content"><span class="eyebrow">LILI TEIXEIRA · BODY PIERCER</span><h2>Beleza em<br><em>cada detalhe.</em></h2><p>Sua curadoria de joias, em um só lugar.</p></div>
  <span class="auth-art-star" aria-hidden="true">✦</span>
</aside>
<section class="panel login-panel">
<div class="eyebrow">PRIMEIRO ACESSO · LILI TEIXEIRA</div><h1>Configurar administrador</h1>
<?php if ($installed): ?>
<p>Já existe um administrador cadastrado. Para acessar, utilize o <a href="login.php">login</a>.</p>
<?php else: ?>
<p>Importe o SQL e configure <code>api/config.local.php</code> antes de continuar.</p>
<?php if ($error): ?><div class="alert error" role="alert"><?= h($error) ?></div><?php endif; ?>
<form method="post"><input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
  <label>Chave de instalação <input type="password" name="setup_key" required autocomplete="off"></label>
  <label>Nome <input name="name" required maxlength="120"></label>
  <label>E-mail <input type="email" name="email" required maxlength="190"></label>
  <label>Senha forte (mínimo 12 caracteres) <input type="password" name="password" minlength="12" required autocomplete="new-password"></label>
  <button class="button primary" type="submit">Criar administrador</button>
</form>
<?php endif; ?>
</section></div></main>
<?php require __DIR__ . '/parts/footer.php'; ?>
