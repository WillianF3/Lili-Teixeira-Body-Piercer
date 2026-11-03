<?php
declare(strict_types=1);
require_once __DIR__ . '/../app/bootstrap.php';

use Lili\App\AdminUserRepository;
admin_session();
if (admin_authenticated()) admin_redirect();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $password = (string)($_POST['password'] ?? '');
    $attempts = (int)($_SESSION['login_attempts'] ?? 0);
    $blockedUntil = (int)($_SESSION['login_blocked_until'] ?? 0);
    if (time() < $blockedUntil) {
        $error = 'Muitas tentativas. Tente novamente em alguns minutos.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) > 1024) {
        $error = 'E-mail ou senha inválidos.';
    } else {
        try {
            $user = (new AdminUserRepository(db()))->findByEmail($email);
            if ($user && password_verify($password, $user['password_hash'])) {
                session_regenerate_id(true);
                $_SESSION['admin_id'] = (int)$user['id'];
                $_SESSION['admin_name'] = $user['name'];
                unset($_SESSION['login_attempts'], $_SESSION['login_blocked_until']);
                admin_redirect();
            }
            $_SESSION['login_attempts'] = $attempts + 1;
            if ($_SESSION['login_attempts'] >= 5) {
                $_SESSION['login_blocked_until'] = time() + 600;
                $_SESSION['login_attempts'] = 0;
            }
            $error = 'E-mail ou senha inválidos.';
        } catch (Throwable $ex) {
            error_log('Admin login: ' . $ex->getMessage());
            $error = 'Não foi possível conectar ao banco. Confira a configuração.';
        }
    }
}
$pageTitle = 'Entrar';
require __DIR__ . '/parts/header.php';
?>
<main class="login-wrap"><div class="auth-layout">
<aside class="auth-art" aria-label="Identidade visual Lili Teixeira">
  <div class="auth-art-content"><span class="eyebrow">LILI TEIXEIRA · BODY PIERCER</span><h2>Beleza em<br><em>cada detalhe.</em></h2><p>Sua curadoria de joias, em um só lugar.</p></div>
  <span class="auth-art-star" aria-hidden="true">✦</span>
</aside>
<section class="panel login-panel">
  <div class="eyebrow">ACESSO RESTRITO · LILI TEIXEIRA</div><h1>Administração</h1><p>Entre para gerenciar as joias exibidas no site.</p>
  <?php if ($error): ?><div class="alert error" role="alert"><?= h($error) ?></div><?php endif; ?>
  <form method="post" autocomplete="on"><input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <label>E-mail <input name="email" type="email" autocomplete="username" required maxlength="190"></label>
    <label>Senha <input name="password" type="password" autocomplete="current-password" required></label>
    <button class="button primary" type="submit">Entrar no painel</button>
  </form>
  <p class="helper">Primeira instalação? Configure o banco e acesse <a href="setup.php">Criar administrador</a>.</p>
</section></div></main>
<?php require __DIR__ . '/parts/footer.php'; ?>
