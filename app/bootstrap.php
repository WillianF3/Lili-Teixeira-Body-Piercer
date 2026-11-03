<?php
/** Carregador leve das classes POO; funções auxiliares mantidas para templates legados. */
declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    $prefix = 'Lili\\App\\';
    if (!str_starts_with($class, $prefix)) return;
    $relative = substr($class, strlen($prefix));
    // Somente nomes de classe simples dentro de app/src, sem navegação de diretórios.
    if (!preg_match('/^[A-Za-z][A-Za-z0-9]*$/D', $relative)) return;
    $file = __DIR__ . '/src/' . $relative . '.php';
    if (is_file($file)) require $file;
});

use Lili\App\Database;
use Lili\App\AdminSession;
use Lili\App\ProductImageStorage;

function app_config(): array { return Database::config(); }
function db(): PDO { return Database::connection(); }
function h(mixed $value): string { return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function admin_session(): void { AdminSession::start(); }
function admin_authenticated(): bool { return AdminSession::authenticated(); }
function admin_require_auth(): void { AdminSession::requireAuth(); }
function csrf_token(): string { return AdminSession::csrfToken(); }
function csrf_check(): void { AdminSession::checkCsrf(); }
function admin_redirect(string $path = '/admin/index.php'): never { AdminSession::redirect($path); }
function set_flash(string $message, bool $error = false): void { AdminSession::flash($message, $error); }
function get_flash(): ?array { return AdminSession::popFlash(); }
function save_uploaded_photo(?array $upload): ?string { return (new ProductImageStorage())->save($upload); }
function remove_uploaded_photo(?string $path): void { (new ProductImageStorage())->remove($path); }
