<?php
/** Catálogo público: somente dados necessários para mostrar produtos. */
declare(strict_types=1);
require_once __DIR__ . '/../app/bootstrap.php';

use Lili\App\ProductRepository;
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET'); http_response_code(405); echo json_encode(['error' => 'Método não permitido']); exit;
}
try {
    $rows = (new ProductRepository(db()))->publicProducts();
    echo json_encode(['products' => $rows], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
} catch (Throwable $exception) {
    error_log('Catalog API: ' . $exception->getMessage());
    http_response_code(503);
    echo json_encode(['error' => 'Catálogo temporariamente indisponível'], JSON_UNESCAPED_UNICODE);
}
