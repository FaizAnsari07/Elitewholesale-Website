<?php
// All methods require header: X-Api-Key: <CATALOG_API_KEY>
// GET    ?              -> WcProduct[]        (optional ?search=)
// GET    ?id=N          -> WcProduct
// POST   (JSON body)    -> WcProduct (201)
// PUT    ?id=N (JSON)   -> WcProduct
// DELETE ?id=N          -> { deleted: true }
require __DIR__ . '/../../lib/config.php';
require_api_key();

$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

function format_wc_product(PDO $pdo, array $row): array {
    $id = (int)$row['id'];

    $cats = $pdo->prepare("SELECT c.id, c.name, c.slug FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = ?");
    $cats->execute([$id]);

    $brands = $pdo->prepare("SELECT b.id, b.name, b.slug FROM brands b JOIN product_brands pb ON pb.brand_id = b.id WHERE pb.product_id = ?");
    $brands->execute([$id]);

    $gallery = $pdo->prepare("SELECT id, url FROM product_images WHERE product_id = ? ORDER BY sort_order");
    $gallery->execute([$id]);
    $galleryRows = $gallery->fetchAll();

    $images = [];
    if ($row['image_url']) {
        $images[] = ['id' => 0, 'src' => $row['image_url'], 'alt' => $row['image_alt'] ?? ''];
    }
    foreach ($galleryRows as $g) {
        $images[] = ['id' => (int)$g['id'], 'src' => $g['url'], 'alt' => ''];
    }

    return [
        'id' => $id,
        'name' => $row['name'],
        'slug' => $row['slug'],
        'type' => $row['type'],
        'status' => $row['status'],
        'sku' => $row['sku'] ?? '',
        'regular_price' => $row['regular_price'] ?? '',
        'sale_price' => $row['sale_price'] ?? '',
        'price' => $row['regular_price'] ?? '',
        'stock_status' => $row['stock_status'],
        'description' => $row['description'] ?? '',
        'short_description' => $row['short_description'] ?? '',
        'categories' => $cats->fetchAll(),
        'brands' => $brands->fetchAll(),
        'images' => $images,
        'date_created' => $row['date_created'],
    ];
}

if ($method === 'GET' && $id) {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) json_out(['message' => 'Not found'], 404);
    json_out(format_wc_product($pdo, $row));
}

if ($method === 'GET') {
    $search = $_GET['search'] ?? null;
    $sql = "SELECT * FROM products";
    $params = [];
    if ($search) {
        $sql .= " WHERE name LIKE ?";
        $params[] = '%' . $search . '%';
    }
    $sql .= " ORDER BY id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_out(array_map(fn($r) => format_wc_product($pdo, $r), $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = json_body();
    $name = (string)($body['name'] ?? '');
    $slug = slugify($name) . '-' . substr(md5((string)microtime(true)), 0, 6);
    $pdo->prepare("
        INSERT INTO products (name, slug, type, status, sku, regular_price, description, short_description, stock_status, image_url, date_created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ")->execute([
        $name,
        $slug,
        $body['type'] ?? 'simple',
        $body['status'] ?? 'publish',
        $body['sku'] ?? '',
        $body['regular_price'] ?? '',
        $body['description'] ?? '',
        $body['short_description'] ?? '',
        $body['stock_status'] ?? 'instock',
        $body['image_url'] ?? null,
    ]);
    $newId = (int)$pdo->lastInsertId();
    if (!empty($body['categories'])) {
        $insCat = $pdo->prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)");
        foreach ($body['categories'] as $c) $insCat->execute([$newId, (int)$c['id']]);
    }
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$newId]);
    json_out(format_wc_product($pdo, $stmt->fetch()), 201);
}

if ($method === 'PUT' && $id) {
    $body = json_body();
    $fields = ['name', 'sku', 'regular_price', 'description', 'short_description', 'status', 'stock_status', 'image_url'];
    $sets = [];
    $params = [];
    foreach ($fields as $f) {
        if (array_key_exists($f, $body)) {
            $sets[] = "$f = ?";
            $params[] = $body[$f];
        }
    }
    if ($sets) {
        $params[] = $id;
        $pdo->prepare("UPDATE products SET " . implode(', ', $sets) . " WHERE id = ?")->execute($params);
    }
    if (array_key_exists('categories', $body)) {
        $pdo->prepare("DELETE FROM product_categories WHERE product_id = ?")->execute([$id]);
        $insCat = $pdo->prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)");
        foreach ($body['categories'] as $c) $insCat->execute([$id, (int)$c['id']]);
    }
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) json_out(['message' => 'Not found'], 404);
    json_out(format_wc_product($pdo, $row));
}

if ($method === 'DELETE' && $id) {
    $pdo->prepare("DELETE FROM products WHERE id = ?")->execute([$id]);
    json_out(['deleted' => true]);
}

json_out(['message' => 'Bad request'], 400);
