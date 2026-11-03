<?php
declare(strict_types=1);
namespace Lili\App;

use RuntimeException;
use Throwable;

/** Cadastro, validação e ciclo de vida das fotos principal/dourada/prateada. */
final class ProductAdminController {
    public const CATEGORIES = ['labret', 'argola', 'especial', 'cluster'];

    public function __construct(
        private readonly ProductRepository $products,
        private readonly ProductImageStorage $images
    ) {}

    public function handle(array $form, array $files): string {
        return match ((string)($form['action'] ?? '')) {
            'save' => $this->save($form, $files),
            'delete' => $this->delete($form),
            default => throw new RuntimeException('Ação inválida.'),
        };
    }

    private function save(array $form, array $files): string {
        $id = filter_var($form['id'] ?? '0', FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
        if ($id === false) throw new RuntimeException('Identificador inválido.');
        $name = trim((string)($form['name'] ?? ''));
        $description = trim((string)($form['description'] ?? ''));
        $category = trim((string)($form['category'] ?? ''));
        $badge = trim((string)($form['badge'] ?? ''));
        $price = trim((string)($form['price'] ?? ''));
        $stock = trim((string)($form['stock_quantity'] ?? ''));
        $sort = filter_var($form['sort_order'] ?? '0', FILTER_VALIDATE_INT);

        if (strlen($name) < 2 || strlen($name) > 160 || strlen($description) > 2500 || strlen($badge) > 45) {
            throw new RuntimeException('Confira os limites de nome, descrição e destaque.');
        }
        if (!in_array($category, self::CATEGORIES, true)) throw new RuntimeException('Categoria inválida.');
        if (!preg_match('/^\d{1,6}(?:[,.]\d{1,2})?$/D', $price)) {
            throw new RuntimeException('Preço inválido. Exemplo: 107,00.');
        }
        $price = str_replace(',', '.', $price);
        if ($stock !== '' && (!ctype_digit($stock) || (int)$stock > 1000000)) {
            throw new RuntimeException('Estoque inválido. Deixe em branco se não deseja controlar.');
        }
        if ($sort === false || $sort < 0 || $sort > 100000) throw new RuntimeException('Ordem inválida.');

        $old = $id > 0 ? $this->products->find($id) : null;
        if ($id > 0 && $old === null) throw new RuntimeException('Produto não encontrado.');
        $supportsColors = $this->products->hasColorColumns();
        if (!$supportsColors && ($this->hasUpload($files['photo_gold'] ?? null) || $this->hasUpload($files['photo_silver'] ?? null)
            || isset($form['remove_photo_gold']) || isset($form['remove_photo_silver']))) {
            throw new RuntimeException('Atualize o banco para habilitar fotos por cor. Confira o aviso no painel.');
        }

        $newFiles = [];
        try {
            // Cada campo é independente: a segunda foto nunca sobrescreve a primeira.
            foreach (['photo', 'photo_gold', 'photo_silver'] as $key) {
                $newFiles[$key] = $this->images->save($files[$key] ?? null);
            }
            $main = $this->resolvedPath($old['image_path'] ?? '', $newFiles['photo'], isset($form['remove_photo']));
            $gold = $this->resolvedPath($old['image_gold_path'] ?? '', $newFiles['photo_gold'], isset($form['remove_photo_gold']));
            $silver = $this->resolvedPath($old['image_silver_path'] ?? '', $newFiles['photo_silver'], isset($form['remove_photo_silver']));

            // Para um produto sem foto genérica, a primeira cor disponível é a capa.
            // Se a capa era a própria foto por cor, atualiza ao trocar/remover essa cor.
            $oldMain = $old['image_path'] ?? '';
            $oldGold = $old['image_gold_path'] ?? '';
            $oldSilver = $old['image_silver_path'] ?? '';
            if (!$newFiles['photo'] && !isset($form['remove_photo']) && (!$oldMain || ($oldMain === $oldGold && $oldGold !== $gold) || ($oldMain === $oldSilver && $oldSilver !== $silver))) {
                $main = $gold ?: $silver;
            }
            if (!$main && !$newFiles['photo'] && !isset($form['remove_photo'])) $main = $gold ?: $silver;

            $values = [
                $name, $description, $category, $price, $main, $badge,
                isset($form['active']) ? 1 : 0,
                isset($form['featured']) ? 1 : 0,
                $stock === '' ? null : (int)$stock,
                $sort,
            ];
            if ($supportsColors) array_push($values, $gold ?: null, $silver ?: null);
            $this->products->save($id, $values);
        } catch (Throwable $error) {
            foreach ($newFiles as $file) if ($file) $this->images->remove($file);
            throw $error;
        }

        $current = array_filter([$main, $gold, $silver]);
        foreach (array_unique(array_filter([$old['image_path'] ?? '', $old['image_gold_path'] ?? '', $old['image_silver_path'] ?? ''])) as $path) {
            if (!in_array($path, $current, true)) $this->images->remove($path);
        }
        return $id > 0 ? 'Produto e imagens atualizados com sucesso.' : 'Novo produto cadastrado com sucesso.';
    }

    private function hasUpload(?array $file): bool {
        return $file !== null && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
    }

    private function resolvedPath(?string $old, ?string $new, bool $remove): string {
        return $new ?? ($remove ? '' : ($old ?? ''));
    }

    private function delete(array $form): string {
        $id = filter_var($form['id'] ?? '', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$id) throw new RuntimeException('Produto inválido.');
        $old = $this->products->find($id);
        if ($old === null) throw new RuntimeException('Produto não encontrado.');
        $this->products->delete($id);
        foreach (array_unique(array_filter([$old['image_path'] ?? '', $old['image_gold_path'] ?? '', $old['image_silver_path'] ?? ''])) as $path) {
            $this->images->remove($path);
        }
        return 'Produto excluído do catálogo.';
    }
}
