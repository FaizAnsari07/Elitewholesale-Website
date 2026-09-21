<?php
declare(strict_types=1);

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
ini_set('display_errors', '0');

// Never leak stack traces or SQL errors to clients.
set_exception_handler(function (Throwable $e): void {
    error_log('[api] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    echo json_encode(['message' => 'Internal server error']);
});

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

function unique_term_slug(PDO $pdo, string $table, string $name): string {
    $base = slugify($name) ?: 'item';
    $slug = $base;
    for ($n = 2; ; $n++) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM $table WHERE slug = ?");
        $stmt->execute([$slug]);
        if ((int)$stmt->fetchColumn() === 0) return $slug;
        $slug = $base . '-' . $n;
    }
}

// SQL condition for products the PUBLIC website may show (use with the table aliased as $alias).
// A product is visible when it is published, ACTIVE (stock_status = 'instock'; "inactive" is stored
// as 'outofstock'), and, if it has flavors, at least one flavor is active.
function visible_product_sql(string $alias = 'p'): string {
    return "$alias.status = 'publish' AND $alias.stock_status = 'instock' AND ($alias.type <> 'variable' OR EXISTS ("
        . "SELECT 1 FROM product_variations pv WHERE pv.product_id = $alias.id AND pv.stock_status = 'instock'))";
}
