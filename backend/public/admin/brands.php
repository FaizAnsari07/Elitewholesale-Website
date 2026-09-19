<?php
// Admin brands API (X-Api-Key required).
// GET ?  -> AdminTerm[] | GET ?id=N -> AdminTerm | POST -> AdminTerm (201)
// PUT ?id=N -> AdminTerm | DELETE ?id=N -> { deleted: true }
// JSON body: name (required), description
require __DIR__ . '/../../lib/config.php';
require_api_key();

$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

function format_term(PDO $pdo, array $row): array {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM product_brands WHERE brand_id = ?");
    $stmt->execute([$row['id']]);
    return [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'description' => $row['description'] ?? '',
        'count' => (int)$stmt->fetchColumn(),
        'image' => null,
    ];
}

function load_term(PDO $pdo, int $id): ?array {
    $stmt = $pdo->prepare("SELECT * FROM brands WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

if ($method === 'GET' && $id) {
    $row = load_term($pdo, $id);
    if (!$row) json_out(['message' => 'Not found'], 404);
    json_out(format_term($pdo, $row));
}

if ($method === 'GET') {
    $rows = $pdo->query("SELECT * FROM brands ORDER BY name")->fetchAll();
    json_out(array_map(fn($r) => format_term($pdo, $r), $rows));
}

if ($method === 'POST') {
    $body = json_body();
    $name = trim((string)($body['name'] ?? ''));
    if ($name === '') json_out(['message' => 'Name is required'], 422);
    $pdo->prepare("INSERT INTO brands (name, slug, description) VALUES (?, ?, ?)")
        ->execute([$name, unique_term_slug($pdo, 'brands', $name), $body['description'] ?? '']);
    json_out(format_term($pdo, load_term($pdo, (int)$pdo->lastInsertId())), 201);
}

if ($method === 'PUT' && $id) {
    if (!load_term($pdo, $id)) json_out(['message' => 'Not found'], 404);
    $body = json_body();
    $name = trim((string)($body['name'] ?? ''));
    if ($name === '') json_out(['message' => 'Name is required'], 422);
    // The slug is kept on rename so existing links and URLs keep working.
    $pdo->prepare("UPDATE brands SET name = ?, description = ? WHERE id = ?")
        ->execute([$name, $body['description'] ?? '', $id]);
    json_out(format_term($pdo, load_term($pdo, $id)));
}

if ($method === 'DELETE' && $id) {
    $pdo->prepare("DELETE FROM brands WHERE id = ?")->execute([$id]);
    json_out(['deleted' => true]);
}

json_out(['message' => 'Bad request'], 400);
