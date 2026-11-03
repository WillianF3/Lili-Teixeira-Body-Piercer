<?php
declare(strict_types=1);
namespace Lili\App;

/** Sessão, CSRF, autenticação por sessão e avisos temporários. */
final class AdminSession {
    public static function start(): void {
        if (session_status() === PHP_SESSION_ACTIVE) return;
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        session_name('LILI_ADMIN');
        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
        session_set_cookie_params([
            'lifetime' => 0, 'path' => '/admin', 'secure' => $https,
            'httponly' => true, 'samesite' => 'Lax'
        ]);
        session_start();
    }

    public static function authenticated(): bool {
        return isset($_SESSION['admin_id']) && is_int($_SESSION['admin_id']);
    }

    public static function requireAuth(): void {
        self::start();
        if (!self::authenticated()) {
            header('Location: /admin/login.php');
            exit;
        }
    }

    public static function csrfToken(): string {
        if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
        return $_SESSION['csrf'];
    }

    public static function checkCsrf(): void {
        if (!isset($_POST['csrf']) || !is_string($_POST['csrf'])
            || !hash_equals(self::csrfToken(), $_POST['csrf'])) {
            http_response_code(403);
            exit('Sessão expirada. Atualize a página e tente novamente.');
        }
    }

    public static function redirect(string $path = '/admin/index.php'): never {
        header('Location: ' . $path, true, 303);
        exit;
    }

    public static function flash(string $message, bool $error = false): void {
        $_SESSION['flash'] = ['message' => $message, 'error' => $error];
    }

    public static function popFlash(): ?array {
        $flash = $_SESSION['flash'] ?? null;
        unset($_SESSION['flash']);
        return $flash;
    }
}
