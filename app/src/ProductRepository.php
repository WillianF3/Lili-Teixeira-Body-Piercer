<?php
declare(strict_types=1);
namespace Lili\App;

use PDO;

/** Persistência de produtos e compatibilidade com bancos anteriores às fotos por cor. */
final class ProductRepository {
    private ?bool $colorColumnsAvailable = null;

    public function __construct(private readonly PDO $pdo) {}

    public function hasColorColumns(): bool {
        if ($this->colorColumnsAvailable !== null) return $this->colorColumnsAvailable;
        $gold = $this->pdo->query("SHOW COLUMNS FROM products LIKE 'image_gold_path'")->fetch();
        $silver = $this->pdo->query("SHOW COLUMNS FROM products LIKE 'image_silver_path'")->fetch();
        return $this->colorColumnsAvailable = (bool)$gold && (bool)$silver;
    }

    /** Chamada somente no painel autenticado: atualização idempotente do esquema. */
    public function ensureColorColumns(): void {
        foreach (['image_gold_path', 'image_silver_path'] as $column) {
            $exists = $this->pdo->query("SHOW COLUMNS FROM products LIKE '" . $column . "'")->fetch();
            if (!$exists) {
                $this->pdo->exec("ALTER TABLE products ADD COLUMN `{$column}` VARCHAR(255) NULL DEFAULT NULL");
            }
        }
        $this->colorColumnsAvailable = true;
    }

    private function colorSelect(): string {
        return $this->hasColorColumns()
            ? 'image_gold_path, image_silver_path'
            : "NULL AS image_gold_path, NULL AS image_silver_path";
    }

    public function publicProducts(): array {
        return $this->pdo->query('SELECT id, name, description, category, price, image_path, badge, featured, stock_quantity, '
            . $this->colorSelect() . ' FROM products WHERE active = 1 ORDER BY sort_order ASC, id ASC')->fetchAll();
    }

    public function all(): array {
        return $this->pdo->query('SELECT id, name, description, category, price, image_path, badge, active, featured, stock_quantity, sort_order, '
            . $this->colorSelect() . ' FROM products ORDER BY sort_order ASC, id ASC')->fetchAll();
    }

    public function find(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT image_path, ' . $this->colorSelect() . ' FROM products WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /** Retorna o ID criado/atualizado para manter a API do painel previsível. */
    public function save(int $id, array $values): int {
        $columns = ['name', 'description', 'category', 'price', 'image_path', 'badge', 'active', 'featured', 'stock_quantity', 'sort_order'];
        if ($this->hasColorColumns()) array_push($columns, 'image_gold_path', 'image_silver_path');
        if (count($values) !== count($columns)) throw new \LogicException('Quantidade de campos de produto inválida.');
        if ($id > 0) {
            $pairs = implode(', ', array_map(static fn(string $column) => "`{$column}` = ?", $columns));
            $stmt = $this->pdo->prepare("UPDATE products SET {$pairs} WHERE id = ?");
            $stmt->execute([...$values, $id]);
            return $id;
        }
        $fields = implode(', ', array_map(static fn(string $column) => "`{$column}`", $columns));
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        $stmt = $this->pdo->prepare("INSERT INTO products ({$fields}) VALUES ({$placeholders})");
        $stmt->execute($values);
        return (int)$this->pdo->lastInsertId();
    }

    public function delete(int $id): void {
        $stmt = $this->pdo->prepare('DELETE FROM products WHERE id=?');
        $stmt->execute([$id]);
    }
}
