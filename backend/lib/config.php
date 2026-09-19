<?php
declare(strict_types=1);

header('Content-Type: application/json');

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $host = getenv('DB_HOST') ?: 'db';
        $port = getenv('DB_PORT') ?: '3306';
        $name = getenv('DB_NAME') ?: 'catalog';
        $user = getenv('DB_USER');
        $pass = getenv('DB_PASSWORD');
        $pdo = new PDO(
            "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4",
            $user,
            $pass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ],
        );
    }
    return $pdo;
}

function json_out($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function require_api_key(): void {
    $expected = getenv('API_KEY');
    $given = $_SERVER['HTTP_X_API_KEY'] ?? '';
    if (!$expected || !hash_equals($expected, $given)) {
        json_out(['message' => 'Unauthorized'], 401);
    }
}

function json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function slugify(string $name): string {
    return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($name)) ?? '', '-');
}
