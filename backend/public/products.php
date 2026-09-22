<?php
// GET /products.php              -> { products: Product[] }
// GET /products.php?slug=X       -> { product: Product | null }
// GET /products.php?category=X   -> { products: Product[] }
// GET /products.php?brand=X      -> { products: Product[] }
// GET /products.php?search=X     -> { products: SearchResult[] }
require __DIR__ . '/../lib/config.php';

$pdo = db();

// Same label the storefront shows for a flavor/option (joins its attribute values).
function variation_label(array $node): string {
    $values = array_filter(array_map(fn($a) => $a['value'], $node['attributes']['nodes']));
    return $values ? implode(' / ', $values) : 'Standard';
}

function hydrate_product(PDO $pdo, array $row): array {
    $id = (int)$row['id'];

    $gallery = $pdo->prepare("SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order");
    $gallery->execute([$id]);
    $galleryUrls = $gallery->fetchAll(PDO::FETCH_COLUMN);

    $cats = $pdo->prepare("SELECT c.name, c.slug FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = ?");
    $cats->execute([$id]);

    $brands = $pdo->prepare("SELECT b.name, b.slug FROM brands b JOIN product_brands pb ON pb.brand_id = b.id WHERE pb.product_id = ?");
    $brands->execute([$id]);

    $attrs = $pdo->prepare("SELECT name, options FROM product_attributes WHERE product_id = ?");
    $attrs->execute([$id]);
    $attributes = array_map(
        fn($a) => ['name' => $a['name'], 'options' => explode('|', $a['options'])],
        $attrs->fetchAll(),
    );

    $variations = null;
    if ($row['type'] === 'variable') {
        // Inactive flavors are never shown on the website.
        $vars = $pdo->prepare("SELECT * FROM product_variations WHERE product_id = ? AND stock_status = 'instock' ORDER BY sort_order");
        $vars->execute([$id]);
        $nodes = [];
        foreach ($vars->fetchAll() as $v) {
            $vattrs = $pdo->prepare("SELECT name, value FROM product_variation_attributes WHERE variation_id = ?");
            $vattrs->execute([$v['id']]);
            $nodes[] = [
                'id' => (string)$v['id'],
                'sku' => $v['sku'],
                'price' => $v['price'],
                'regularPrice' => $v['regular_price'],
                'stockStatus' => $v['stock_status'] === 'outofstock' ? 'OUT_OF_STOCK' : 'IN_STOCK',
                'attributes' => ['nodes' => $vattrs->fetchAll()],
                'image' => $v['image_url'] ? ['sourceUrl' => $v['image_url']] : null,
            ];
        }
        // Show flavors/options in alphabetical (A-Z) order on the product page.
        usort($nodes, fn($a, $b) => strcasecmp(variation_label($a), variation_label($b)));
        $variations = ['nodes' => $nodes];
    }

    return [
        'id' => (string)$id,
        'databaseId' => $id,
        'slug' => $row['slug'],
        'name' => $row['name'],
        'date' => $row['date_created'] ? str_replace(' ', 'T', (string)$row['date_created']) : null,
        'description' => $row['description'],
        'shortDescription' => $row['short_description'],
        'image' => $row['image_url'] ? ['sourceUrl' => $row['image_url'], 'altText' => $row['image_alt'] ?? ''] : null,
        'galleryImages' => ['nodes' => array_map(fn($u) => ['sourceUrl' => $u], $galleryUrls)],
        'productCategories' => ['nodes' => $cats->fetchAll()],
        'productBrands' => ['nodes' => $brands->fetchAll()],
        'sku' => $row['sku'],
        'stockStatus' => $row['stock_status'] === 'outofstock' ? 'OUT_OF_STOCK' : 'IN_STOCK',
        'price' => $row['regular_price'],
        'regularPrice' => $row['regular_price'],
        'variations' => $variations,
        'attributes' => ['nodes' => $attributes],
    ];
}

$slug = $_GET['slug'] ?? null;
$category = $_GET['category'] ?? null;
$brand = $_GET['brand'] ?? null;
$search = $_GET['search'] ?? null;

if ($slug !== null) {
    $stmt = $pdo->prepare("SELECT p.* FROM products p WHERE p.slug = ? AND " . visible_product_sql() . " LIMIT 1");
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    json_out(['product' => $row ? hydrate_product($pdo, $row) : null]);
}

if ($category !== null) {
    $stmt = $pdo->prepare("
        SELECT p.* FROM products p
        JOIN product_categories pc ON pc.product_id = p.id
        JOIN categories c ON c.id = pc.category_id
        WHERE c.slug = ? AND " . visible_product_sql() . "
    ");
    $stmt->execute([$category]);
    json_out(['products' => array_map(fn($r) => hydrate_product($pdo, $r), $stmt->fetchAll())]);
}

if ($brand !== null) {
    $stmt = $pdo->prepare("
        SELECT p.* FROM products p
        JOIN product_brands pb ON pb.product_id = p.id
        JOIN brands b ON b.id = pb.brand_id
        WHERE b.slug = ? AND " . visible_product_sql() . "
    ");
    $stmt->execute([$brand]);
    json_out(['products' => array_map(fn($r) => hydrate_product($pdo, $r), $stmt->fetchAll())]);
}

if ($search !== null) {
    $stmt = $pdo->prepare("SELECT p.slug, p.name, p.image_url, p.image_alt FROM products p WHERE " . visible_product_sql() . " AND p.name LIKE ? LIMIT 8");
    $stmt->execute(['%' . $search . '%']);
    $rows = $stmt->fetchAll();
    json_out(['products' => array_map(fn($r) => [
        'slug' => $r['slug'],
        'name' => $r['name'],
        'image' => $r['image_url'] ? ['sourceUrl' => $r['image_url'], 'altText' => $r['image_alt'] ?? ''] : null,
    ], $rows)]);
}

$rows = $pdo->query("SELECT p.* FROM products p WHERE " . visible_product_sql())->fetchAll();
json_out(['products' => array_map(fn($r) => hydrate_product($pdo, $r), $rows)]);
