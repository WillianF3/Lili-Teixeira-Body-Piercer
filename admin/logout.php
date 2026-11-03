<?php
declare(strict_types=1);
require_once __DIR__ . '/../app/bootstrap.php';
admin_require_auth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('Método não permitido'); }
csrf_check();
$_SESSION = [];
session_regenerate_id(true);
session_destroy();
header('Location: /admin/login.php', true, 303);
exit;
