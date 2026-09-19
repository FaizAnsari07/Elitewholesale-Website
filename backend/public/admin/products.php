<?php
// Admin product API. All methods require header: X-Api-Key: <CATALOG_API_KEY>
// GET    ?              -> AdminProduct[]        (optional ?search=)
// GET    ?id=N          -> AdminProduct
// POST   (JSON body)    -> AdminProduct (201)
// PUT    ?id=N (JSON)   -> AdminProduct
// DELETE ?id=N          -> { deleted: true }
//
// JSON body fields: name, sku, regular_price, description, short_description, status,
// stock_status, image_url, categories: [{id}], brands: [{id}],
// variations: [{id?, label, stock_status}]  (products with variations are type "variable")
require __DIR__ . '/../../lib/config.php';
require_api_key();

$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

const STOCK = ['instock', 'outofstock'];
const STATUS = ['publish', 'draft'];

function fail(string $message, int $status = 422): void {
    json_out(['message' => $message], $status);
}

function format_product(PDO $pdo, array $row): array {
    $id = (int)$row['id'];

    $cats = $pdo->prepare("SELECT c.id, c.name, c.slug FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = ?");
    $cats->execute([$id]);
    $brands = $pdo->prepare("SELECT b.id, b.name, b.slug FROM brands b JOIN product_brands pb ON pb.brand_id = b.id WHERE pb.product_id = ?");
    $brands->execute([$id]);

    $vars = $pdo->prepare("
        SELECT v.id, v.stock_status,
               (SELECT GROUP_CONCAT(a.value ORDER BY a.id SEPARATOR ' / ')
                  FROM product_variation_attributes a WHERE a.variation_id = v.id) AS label
        FROM product_variations v WHERE v.product_id = ? ORDER BY v.sort_order, v.id");
    $vars->execute([$id]);
    $variations = array_map(fn($v) => [
        'id' => (int)$v['id'],
        'label' => $v['label'] ?? '',
        'stock_status' => $v['stock_status'],
    ], $vars->fetchAll());

    $images = [];
    if ($row['image_url']) {
        $images[] = ['id' => 0, 'src' => $row['image_url'], 'alt' => $row['image_alt'] ?? ''];
    }

    return [
        'id' => $id,
        'name' => $row['name'],
        'slug' => $row['slug'],
        'type' => $row['type'],
        'status' => $row['status'],
        'sku' => $row['sku'] ?? '',
        'regular_price' => $row['regular_price'] ?? '',
        'stock_status' => $row['stock_status'],
        'description' => $row['description'] ?? '',
        'short_description' => $row['short_description'] ?? '',
        'categories' => $cats->fetchAll(),
        'brands' => $brands->fetchAll(),
        'variations' => $variations,
        'images' => $images,
        'date_created' => $row['date_created'],
    ];
}

function load(PDO $pdo, int $id): ?array {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function unique_slug(PDO $pdo, string $name, ?int $exceptId = null): string {
    $base = slugify($name) ?: 'product';
    $slug = $base;
    for ($n = 2; ; $n++) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE slug = ? AND id <> ?");
        $stmt->execute([$slug, $exceptId ?? 0]);
        if ((int)$stmt->fetchColumn() === 0) return $slug;
        $slug = $base . '-' . $n;
    }
}

function validate(array $body, bool $creating): void {
    if ($creating && trim((string)($body['name'] ?? '')) === '') fail('Name is required');
    if (array_key_exists('name', $body) && trim((string)$body['name']) === '') fail('Name is required');
    if (isset($body['stock_status']) && !in_array($body['stock_status'], STOCK, true)) fail('Invalid stock status');
    if (isset($body['status']) && !in_array($body['status'], STATUS, true)) fail('Invalid status');
    foreach ($body['variations'] ?? [] as $v) {
        if (!empty($v['stock_status']) && !in_array($v['stock_status'], STOCK, true)) fail('Invalid variation stock status');
    }
}

function sync_links(PDO $pdo, int $productId, string $table, string $column, array $items): void {
    $pdo->prepare("DELETE FROM $table WHERE product_id = ?")->execute([$productId]);
    $ins = $pdo->prepare("INSERT IGNORE INTO $table (product_id, $column) VALUES (?, ?)");
    foreach ($items as $item) {
        if (!empty($item['id'])) $ins->execute([$productId, (int)$item['id']]);
    }
}

// Existing variations keep their attributes (only stock changes); ones missing from the
// list are deleted; entries without an id become new "Flavor" variations.
function sync_variations(PDO $pdo, int $productId, array $variations): void {
    $keep = [];
    $order = 0;
    foreach ($variations as $v) {
        $stock = $v['stock_status'] ?? 'instock';
        if (!empty($v['id'])) {
            $upd = $pdo->prepare("UPDATE product_variations SET stock_status = ?, sort_order = ? WHERE id = ? AND product_id = ?");
            $upd->execute([$stock, $order++, (int)$v['id'], $productId]);
            $keep[] = (int)$v['id'];
        } else {
            $label = trim((string)($v['label'] ?? ''));
            if ($label === '') continue;
            $pdo->prepare("INSERT INTO product_variations (product_id, stock_status, sort_order) VALUES (?, ?, ?)")
                ->execute([$productId, $stock, $order++]);
            $newId = (int)$pdo->lastInsertId();
            $pdo->prepare("INSERT INTO product_variation_attributes (variation_id, name, value) VALUES (?, 'Flavor', ?)")
                ->execute([$newId, $label]);
            $keep[] = $newId;
        }
    }
    $existing = $pdo->prepare("SELECT id FROM product_variations WHERE product_id = ?");
    $existing->execute([$productId]);
    $del = $pdo->prepare("DELETE FROM product_variations WHERE id = ?");
    foreach ($existing->fetchAll(PDO::FETCH_COLUMN) as $vid) {
        if (!in_array((int)$vid, $keep, true)) $del->execute([$vid]);
    }
    $pdo->prepare("UPDATE products SET type = ? WHERE id = ?")
        ->execute([count($keep) > 0 ? 'variable' : 'simple', $productId]);
}

if ($method === 'GET' && $id) {
    $row = load($pdo, $id);
    if (!$row) json_out(['message' => 'Not found'], 404);
    json_out(format_product($pdo, $row));
}

if ($method === 'GET') {
    $search = $_GET['search'] ?? null;
    $sql = "SELECT * FROM products";
    $params = [];
    if (is_string($search) && $search !== '') {
        $sql .= " WHERE name LIKE ?";
        $params[] = '%' . $search . '%';
    }
    $stmt = $pdo->prepare($sql . " ORDER BY id DESC");
    $stmt->execute($params);
    json_out(array_map(fn($r) => format_product($pdo, $r), $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = json_body();
    validate($body, true);
    $pdo->beginTransaction();
    $pdo->prepare("
        INSERT INTO products (name, slug, type, status, sku, regular_price, description, short_description, stock_status, image_url, date_created)
        VALUES (?, ?, 'simple', ?, ?, ?, ?, ?, ?, ?, NOW())
    ")->execute([
        trim($body['name']),
        unique_slug($pdo, $body['name']),
        $body['status'] ?? 'publish',
        $body['sku'] ?? '',
        $body['regular_price'] ?? '',
        $body['description'] ?? '',
        $body['short_description'] ?? '',
        $body['stock_status'] ?? 'instock',
        $body['image_url'] ?? null,
    ]);
    $newId = (int)$pdo->lastInsertId();
    sync_links($pdo, $newId, 'product_categories', 'category_id', $body['categories'] ?? []);
    sync_links($pdo, $newId, 'product_brands', 'brand_id', $body['brands'] ?? []);
    if (!empty($body['variations'])) sync_variations($pdo, $newId, $body['variations']);
    $pdo->commit();
    json_out(format_product($pdo, load($pdo, $newId)), 201);
}

if ($method === 'PUT' && $id) {
    if (!load($pdo, $id)) json_out(['message' => 'Not found'], 404);
    $body = json_body();
    validate($body, false);
    $pdo->beginTransaction();
    $sets = [];
    $params = [];
    foreach (['name', 'sku', 'regular_price', 'description', 'short_description', 'status', 'stock_status', 'image_url'] as $f) {
        if (array_key_exists($f, $body)) {
            $sets[] = "$f = ?";
            $params[] = $f === 'name' ? trim($body[$f]) : $body[$f];
        }
    }
    if ($sets) {
        $params[] = $id;
        $pdo->prepare("UPDATE products SET " . implode(', ', $sets) . " WHERE id = ?")->execute($params);
    }
    if (array_key_exists('categories', $body)) sync_links($pdo, $id, 'product_categories', 'category_id', $body['categories']);
    if (array_key_exists('brands', $body)) sync_links($pdo, $id, 'product_brands', 'brand_id', $body['brands']);
    if (array_key_exists('variations', $body)) sync_variations($pdo, $id, $body['variations']);
    $pdo->commit();
    json_out(format_product($pdo, load($pdo, $id)));
}

if ($method === 'DELETE' && $id) {
    $pdo->prepare("DELETE FROM products WHERE id = ?")->execute([$id]);
    json_out(['deleted' => true]);
}

json_out(['message' => 'Bad request'], 400);
