<?php
declare(strict_types=1);
namespace Lili\App;

use PDO;
use RuntimeException;

/** Conexão PDO compartilhada, criada apenas quando solicitada. */
final class Database {
    private static ?PDO $connection = null;

    public static function config(): array {
        $file = dirname(__DIR__, 2) . '/api/config.local.php';
        if (!is_file($file)) throw new RuntimeException('Arquivo de configuração não instalado.');
        $config = require $file;
        if (!is_array($config)) throw new RuntimeException('Configuração inválida.');
        return $config;
    }

    public static function connection(): PDO {
        if (self::$connection !== null) return self::$connection;
        $config = self::config();
        foreach (['host', 'database', 'username', 'password'] as $key) {
            if (!isset($config[$key]) || !is_string($config[$key])) {
                throw new RuntimeException('Campo de configuração inválido.');
            }
        }
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $config['host'], (int)($config['port'] ?? 3306), $config['database']);
        self::$connection = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return self::$connection;
    }
}
