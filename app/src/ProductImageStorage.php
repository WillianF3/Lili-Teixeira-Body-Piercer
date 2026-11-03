<?php
declare(strict_types=1);
namespace Lili\App;

use RuntimeException;
use finfo;

/** Guarda uploads de imagens em diretório público, com validação de conteúdo. */
final class ProductImageStorage {
    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    private string $directory;

    public function __construct(?string $directory = null) {
        $this->directory = $directory ?? dirname(__DIR__, 2) . '/uploads/products';
    }

    public function save(?array $upload): ?string {
        if ($upload === null || ($upload['error'] ?? null) === UPLOAD_ERR_NO_FILE) return null;
        if (($upload['error'] ?? -1) !== UPLOAD_ERR_OK) throw new RuntimeException('Não foi possível receber a foto.');
        if (($upload['size'] ?? 0) > 4 * 1024 * 1024 || ($upload['size'] ?? 0) < 1) {
            throw new RuntimeException('A foto deve ter até 4 MB.');
        }
        $temp = $upload['tmp_name'] ?? '';
        if (!is_string($temp) || !is_uploaded_file($temp)) throw new RuntimeException('Upload inválido.');
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($temp);
        if (!isset(self::MIME_EXTENSIONS[$mime]) || getimagesize($temp) === false) {
            throw new RuntimeException('Use imagens JPEG, PNG ou WebP.');
        }
        if (!is_dir($this->directory) || !is_writable($this->directory)) {
            throw new RuntimeException('A pasta uploads/products precisa de permissão de escrita.');
        }
        $fileName = bin2hex(random_bytes(16)) . '.' . self::MIME_EXTENSIONS[$mime];
        if (!move_uploaded_file($temp, $this->directory . '/' . $fileName)) {
            throw new RuntimeException('Falha ao salvar a foto.');
        }
        return 'uploads/products/' . $fileName;
    }

    public function remove(?string $path): void {
        // Não removemos imagens estáticas do projeto, nem caminhos arbitrários.
        if ($path && preg_match('~^uploads/products/[a-f0-9]{32}\.(?:jpg|png|webp)$~D', $path)) {
            $absolute = $this->directory . '/' . basename($path);
            if (is_file($absolute)) @unlink($absolute);
        }
    }
}
