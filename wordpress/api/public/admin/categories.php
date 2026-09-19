<?php
require __DIR__ . '/../../lib/config.php';
require_api_key();

$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

function format_category_term(PDO $pdo, array $row): array {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM product_categories WHERE category_id = ?");
    $stmt->execute([$row['id']]);
    return [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'description' => $row['description'] ?? '',
        'count' => (int)$stmt->fetchColumn(),
        'image' => $row['image_url'] ? ['id' => 0, 'src' => $row['image_url']] : null,
    ];
}

if ($method === 'GET' && $id) {
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) json_out(['message' => 'Not found'], 404);
    json_out(format_category_term($pdo, $row));
}

if ($method === 'GET') {
    $rows = $pdo->query("SELECT * FROM categories ORDER BY name")->fetchAll();
    json_out(array_map(fn($r) => format_category_term($pdo, $r), $rows));
}

if ($method === 'POST') {
    $body = json_body();
    $name = (string)($body['name'] ?? '');
    $slug = slugify($name) . '-' . substr(md5((string)microtime(true)), 0, 6);
    $pdo->prepare("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)")
        ->execute([$name, $slug, $body['description'] ?? '']);
    $newId = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$newId]);
    json_out(format_category_term($pdo, $stmt->fetch()), 201);
}

if ($method === 'PUT' && $id) {
    $body = json_body();
    $pdo->prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?")
        ->execute([$body['name'] ?? '', $body['description'] ?? '', $id]);
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) json_out(['message' => 'Not found'], 404);
    json_out(format_category_term($pdo, $row));
}

if ($method === 'DELETE' && $id) {
    $pdo->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
    json_out(['deleted' => true]);
}

json_out(['message' => 'Bad request'], 400);
