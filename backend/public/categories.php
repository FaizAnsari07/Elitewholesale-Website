<?php
// GET /categories.php          -> { productCategories: { nodes: Category[] } }
// GET /categories.php?slug=X   -> { productCategory: Category | null }
require __DIR__ . '/../lib/config.php';

$pdo = db();

function format_category(array $row): array {
    return [
        'databaseId' => (int)$row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'count' => (int)$row['product_count'],
        'description' => $row['description'],
        'image' => $row['image_url'] ? ['sourceUrl' => $row['image_url']] : null,
    ];
}

// Counts only include products the website actually shows (active + published).
$baseSql = "SELECT c.*, (SELECT COUNT(*) FROM product_categories pc JOIN products p ON p.id = pc.product_id WHERE pc.category_id = c.id AND " . visible_product_sql() . ") AS product_count FROM categories c";

$slug = $_GET['slug'] ?? null;
if ($slug !== null) {
    $stmt = $pdo->prepare($baseSql . " WHERE c.slug = ?");
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    json_out(['productCategory' => $row ? format_category($row) : null]);
}

$rows = $pdo->query($baseSql)->fetchAll();
json_out(['productCategories' => ['nodes' => array_map('format_category', $rows)]]);
