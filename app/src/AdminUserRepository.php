<?php
declare(strict_types=1);
namespace Lili\App;

use PDO;

/** SQL de autenticação e primeiro acesso separado das páginas do painel. */
final class AdminUserRepository {
    public function __construct(private readonly PDO $pdo) {}

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare('SELECT id, name, password_hash FROM admin_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function hasAny(): bool {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn() > 0;
    }

    public function create(string $name, string $email, string $password): void {
        $stmt = $this->pdo->prepare('INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)');
        $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
    }
}
