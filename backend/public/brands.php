<?php
// GET /brands.php                          -> { productBrands: { nodes: Brand[] } }
// GET /brands.php?slug=X                   -> { productBrand: Brand | null }
// GET /brands.php?slug=X&sample_image=1    -> adds `sampleImage` to the brand
require __DIR__ . '/../lib/config.php';

$pdo = db();

function format_brand(array $row): array {
    return [
        'databaseId' => (int)$row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'count' => (int)$row['product_count'],
    ];
}

function sample_image(PDO $pdo, int $brandId): ?string {
    $stmt = $pdo->prepare("
        SELECT p.image_url FROM products p
        JOIN product_brands pb ON pb.product_id = p.id
        WHERE pb.brand_id = ? AND p.image_url IS NOT NULL AND " . visible_product_sql() . "
        LIMIT 1
    ");
    $stmt->execute([$brandId]);
    $url = $stmt->fetchColumn();
    return $url === false ? null : $url;
}

// Counts only include products the website actually shows (active + published).
$baseSql = "SELECT b.*, (SELECT COUNT(*) FROM product_brands pb JOIN products p ON p.id = pb.product_id WHERE pb.brand_id = b.id AND " . visible_product_sql() . ") AS product_count FROM brands b";
$withSample = isset($_GET['sample_image']);

$slug = $_GET['slug'] ?? null;
if ($slug !== null) {
    $stmt = $pdo->prepare($baseSql . " WHERE b.slug = ?");
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    if (!$row) json_out(['productBrand' => null]);
    $result = format_brand($row);
    if ($withSample) $result['sampleImage'] = sample_image($pdo, (int)$row['id']);
    json_out(['productBrand' => $result]);
}

$rows = $pdo->query($baseSql)->fetchAll();
$nodes = array_map('format_brand', $rows);
if ($withSample) {
    foreach ($rows as $i => $row) {
        $nodes[$i]['sampleImage'] = sample_image($pdo, (int)$row['id']);
    }
}
json_out(['productBrands' => ['nodes' => $nodes]]);
