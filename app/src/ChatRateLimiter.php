<?php
declare(strict_types=1);
namespace Lili\App;

/** Limite simples por IP com bloqueio de arquivo, sem armazenar transcrições. */
final class ChatRateLimiter {
    public function allow(string $ip): bool {
        $directory = sys_get_temp_dir();
        if (!is_writable($directory)) return false; // Falhar fechado para proteger custos da API.
        $file = rtrim($directory, '/\\') . '/lili_chat_rate_' . hash('sha256', $ip) . '.json';
        $handle = @fopen($file, 'c+');
        if ($handle === false) return false;
        try {
            if (!flock($handle, LOCK_EX)) return false;
            $raw = stream_get_contents($handle);
            $timestamps = json_decode($raw ?: '[]', true);
            if (!is_array($timestamps)) $timestamps = [];
            $now = time();
            $timestamps = array_values(array_filter($timestamps, static fn($time): bool => is_int($time) && $time > $now - 3600));
            $recent = count(array_filter($timestamps, static fn($time): bool => $time > $now - 600));
            if ($recent >= 18 || count($timestamps) >= 55) return false;
            $timestamps[] = $now;
            ftruncate($handle, 0);
            rewind($handle);
            fwrite($handle, json_encode($timestamps));
            fflush($handle);
            return true;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }
}
