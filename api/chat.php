<?php
/** Endpoint público do chatbot. Respostas JSON, sem acesso à administração. */
declare(strict_types=1);
require_once __DIR__ . '/../app/bootstrap.php';

use Lili\App\ChatAssistant;
use Lili\App\ChatKnowledgeBase;
use Lili\App\ChatRateLimiter;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function chat_json(int $status, array $data): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    chat_json(405, ['error' => 'Método não permitido.']);
}
$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
if (!str_starts_with($contentType, 'application/json')) chat_json(415, ['error' => 'Envie JSON.']);
$site = (string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '');
if ($site === 'cross-site') chat_json(403, ['error' => 'Origem não autorizada.']);
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    if (!is_string($originHost) || strtolower($originHost) !== strtolower(explode(':', $host)[0])) {
        chat_json(403, ['error' => 'Origem não autorizada.']);
    }
}
$raw = file_get_contents('php://input', false, null, 0, 9000);
if (!is_string($raw) || strlen($raw) > 8000) chat_json(413, ['error' => 'Mensagem muito grande.']);
try { $body = json_decode($raw, true, 12, JSON_THROW_ON_ERROR); }
catch (\JsonException) { chat_json(400, ['error' => 'Mensagem inválida.']); }
$message = $body['message'] ?? null;
if (!is_string($message)) chat_json(400, ['error' => 'Escreva uma pergunta.']);
$message = trim($message);
if ($message === '' || strlen($message) > 1600 || preg_match('//u', $message) !== 1) {
    chat_json(422, ['error' => 'Pergunta inválida ou muito longa.']);
}
$history = $body['history'] ?? [];
if (!is_array($history)) $history = [];
$history = array_slice(array_values($history), -8);
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (!(new ChatRateLimiter())->allow($ip)) chat_json(429, ['error' => 'Muitas mensagens seguidas. Tente novamente mais tarde ou fale com a Lili pelo WhatsApp.']);

try {
    $answer = (new ChatAssistant(new ChatKnowledgeBase()))->answer($message, $history);
    chat_json(200, $answer);
} catch (\Throwable $exception) {
    error_log('Chat endpoint: ' . get_class($exception));
    chat_json(503, ['error' => 'O atendimento virtual está temporariamente indisponível. Use o WhatsApp.']);
}
