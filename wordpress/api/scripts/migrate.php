<?php
// Run once (idempotent: truncates and re-populates `catalog` every run) via:
//   docker compose run --rm api php migrate.php
declare(strict_types=1);

function connect(string $dbName): PDO {
    $host = getenv('DB_HOST') ?: 'db';
    $port = getenv('DB_PORT') ?: '3306';
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASSWORD');
    return new PDO(
        "mysql:host=$host;port=$port;dbname=$dbName;charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC],
    );
}

function rewrite_image_url(?string $guid): ?string {
    if (!$guid) return null;
    $marker = '/wp-content/uploads/';
    $pos = strpos($guid, $marker);
    if ($pos === false) return null;
    return '/uploads/' . substr($guid, $pos + strlen($marker));
}

function postmeta(PDO $wp, int $postId, string $key): ?string {
    $stmt = $wp->prepare("SELECT meta_value FROM wp_postmeta WHERE post_id = ? AND meta_key = ? LIMIT 1");
    $stmt->execute([$postId, $key]);
    $v = $stmt->fetchColumn();
    return $v === false || $v === '' ? null : (string)$v;
}

function attachment_guid(PDO $wp, ?string $attachmentId): ?string {
    if (!$attachmentId) return null;
    $stmt = $wp->prepare("SELECT guid FROM wp_posts WHERE ID = ?");
    $stmt->execute([(int)$attachmentId]);
    $guid = $stmt->fetchColumn();
    return $guid === false ? null : (string)$guid;
}

function stock_status(?string $raw): string {
    return strtolower((string)$raw) === 'outofstock' ? 'outofstock' : 'instock';
}

$wp = connect('wordpress');
$cat = connect('catalog');

echo "Clearing existing catalog data...\n";
$cat->exec('SET FOREIGN_KEY_CHECKS=0');
foreach (['product_variation_attributes','product_variations','product_attributes','product_images','product_categories','product_brands','products','categories','brands'] as $t) {
    $cat->exec("TRUNCATE TABLE $t");
}
$cat->exec('SET FOREIGN_KEY_CHECKS=1');

// ---- Categories ----
echo "Migrating categories...\n";
$categoryMap = []; // wp_term_id => new catalog id
$stmt = $wp->query("
    SELECT t.term_id, t.name, t.slug, tt.description
    FROM wp_terms t
    JOIN wp_term_taxonomy tt ON tt.term_id = t.term_id
    WHERE tt.taxonomy = 'product_cat'
");
$insCat = $cat->prepare("INSERT INTO categories (wp_term_id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)");
foreach ($stmt->fetchAll() as $row) {
    $thumbStmt = $wp->prepare("SELECT meta_value FROM wp_termmeta WHERE term_id = ? AND meta_key = 'thumbnail_id'");
    $thumbStmt->execute([$row['term_id']]);
    $thumbId = $thumbStmt->fetchColumn();
    $imageUrl = rewrite_image_url(attachment_guid($wp, $thumbId ?: null));
    $insCat->execute([$row['term_id'], html_entity_decode($row['name']), $row['slug'], $row['description'] ?: null, $imageUrl]);
    $categoryMap[(int)$row['term_id']] = (int)$cat->lastInsertId();
}
echo "  " . count($categoryMap) . " categories\n";

// ---- Brands ----
echo "Migrating brands...\n";
$brandMap = [];
$stmt = $wp->query("
    SELECT t.term_id, t.name, t.slug, tt.description
    FROM wp_terms t
    JOIN wp_term_taxonomy tt ON tt.term_id = t.term_id
    WHERE tt.taxonomy = 'product_brand'
");
$insBrand = $cat->prepare("INSERT INTO brands (wp_term_id, name, slug, description) VALUES (?, ?, ?, ?)");
foreach ($stmt->fetchAll() as $row) {
    $insBrand->execute([$row['term_id'], html_entity_decode($row['name']), $row['slug'], $row['description'] ?: null]);
    $brandMap[(int)$row['term_id']] = (int)$cat->lastInsertId();
}
echo "  " . count($brandMap) . " brands\n";

// ---- Products ----
echo "Migrating products...\n";
$productMap = []; // wp_post_id => new catalog id
$missingImages = [];
$products = $wp->query("
    SELECT ID, post_title, post_name, post_content, post_excerpt, post_date
    FROM wp_posts
    WHERE post_type = 'product' AND post_status = 'publish'
")->fetchAll();

$insProduct = $cat->prepare("
    INSERT INTO products (wp_post_id, name, slug, type, status, sku, regular_price, sale_price, description, short_description, stock_status, image_url, image_alt, date_created)
    VALUES (?, ?, ?, ?, 'publish', ?, ?, ?, ?, ?, ?, ?, ?, ?)
");
$insProdCat = $cat->prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)");
$insProdBrand = $cat->prepare("INSERT INTO product_brands (product_id, brand_id) VALUES (?, ?)");
$insImage = $cat->prepare("INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)");
$insAttr = $cat->prepare("INSERT INTO product_attributes (product_id, name, options) VALUES (?, ?, ?)");

$termRelStmt = $wp->prepare("
    SELECT tt.taxonomy, tt.term_id
    FROM wp_term_relationships tr
    JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    WHERE tr.object_id = ?
");

foreach ($products as $p) {
    $wpId = (int)$p['ID'];
    $thumbId = postmeta($wp, $wpId, '_thumbnail_id');
    $imageUrl = rewrite_image_url(attachment_guid($wp, $thumbId));
    if (!$imageUrl) {
        $missingImages[] = $wpId;
    }
    $imageAlt = $thumbId ? (postmeta($wp, (int)$thumbId, '_wp_attachment_image_alt') ?? '') : '';

    $termRelStmt->execute([$wpId]);
    $rels = $termRelStmt->fetchAll();
    $type = 'simple';
    $catIds = [];
    $brandIds = [];
    foreach ($rels as $rel) {
        if ($rel['taxonomy'] === 'product_type') {
            $nameStmt = $wp->prepare("SELECT name FROM wp_terms WHERE term_id = ?");
            $nameStmt->execute([$rel['term_id']]);
            $typeName = $nameStmt->fetchColumn();
            if ($typeName === 'variable') $type = 'variable';
        } elseif ($rel['taxonomy'] === 'product_cat' && isset($categoryMap[(int)$rel['term_id']])) {
            $catIds[] = $categoryMap[(int)$rel['term_id']];
        } elseif ($rel['taxonomy'] === 'product_brand' && isset($brandMap[(int)$rel['term_id']])) {
            $brandIds[] = $brandMap[(int)$rel['term_id']];
        }
    }

    $insProduct->execute([
        $wpId,
        html_entity_decode($p['post_title']),
        $p['post_name'],
        $type,
        postmeta($wp, $wpId, '_sku'),
        postmeta($wp, $wpId, '_regular_price'),
        postmeta($wp, $wpId, '_sale_price'),
        $p['post_content'] ?: null,
        $p['post_excerpt'] ?: null,
        stock_status(postmeta($wp, $wpId, '_stock_status')),
        $imageUrl,
        $imageAlt ?: null,
        $p['post_date'],
    ]);
    $newId = (int)$cat->lastInsertId();
    $productMap[$wpId] = $newId;

    foreach (array_unique($catIds) as $cid) $insProdCat->execute([$newId, $cid]);
    foreach (array_unique($brandIds) as $bid) $insProdBrand->execute([$newId, $bid]);

    $galleryRaw = postmeta($wp, $wpId, '_product_image_gallery');
    if ($galleryRaw) {
        $order = 0;
        foreach (explode(',', $galleryRaw) as $attId) {
            $url = rewrite_image_url(attachment_guid($wp, trim($attId)));
            if ($url) $insImage->execute([$newId, $url, $order++]);
        }
    }

    $attrRaw = postmeta($wp, $wpId, '_product_attributes');
    if ($attrRaw) {
        $parsed = @unserialize($attrRaw);
        if (is_array($parsed)) {
            foreach ($parsed as $attr) {
                if (empty($attr['name']) || empty($attr['value'])) continue;
                $options = array_map('trim', explode('|', (string)$attr['value']));
                $insAttr->execute([$newId, $attr['name'], implode('|', $options)]);
            }
        }
    }
}
echo "  " . count($productMap) . " products (" . count($missingImages) . " missing a thumbnail file: " . implode(', ', $missingImages) . ")\n";

// ---- Variations ----
echo "Migrating variations...\n";
$variations = $wp->query("
    SELECT ID, post_parent, post_title
    FROM wp_posts
    WHERE post_type = 'product_variation' AND post_status = 'publish'
")->fetchAll();

$insVariation = $cat->prepare("
    INSERT INTO product_variations (wp_post_id, product_id, sku, price, regular_price, stock_status, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");
$insVarAttr = $cat->prepare("INSERT INTO product_variation_attributes (variation_id, name, value) VALUES (?, ?, ?)");
$varMetaStmt = $wp->prepare("SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ? AND meta_key LIKE 'attribute\\_%'");

$orphanVariations = [];
$order = 0;
foreach ($variations as $v) {
    $parentWpId = (int)$v['post_parent'];
    if (!isset($productMap[$parentWpId])) {
        $orphanVariations[] = (int)$v['ID'];
        continue;
    }
    $wpId = (int)$v['ID'];
    $thumbId = postmeta($wp, $wpId, '_thumbnail_id');
    $imageUrl = rewrite_image_url(attachment_guid($wp, $thumbId));

    $insVariation->execute([
        $wpId,
        $productMap[$parentWpId],
        postmeta($wp, $wpId, '_sku'),
        postmeta($wp, $wpId, '_price'),
        postmeta($wp, $wpId, '_regular_price'),
        stock_status(postmeta($wp, $wpId, '_stock_status')),
        $imageUrl,
        $order++,
    ]);
    $newVarId = (int)$cat->lastInsertId();

    $varMetaStmt->execute([$wpId]);
    foreach ($varMetaStmt->fetchAll() as $meta) {
        $name = str_replace(['attribute_', '-'], ['', ' '], $meta['meta_key']);
        $name = ucfirst($name);
        if ($meta['meta_value'] !== '') {
            $insVarAttr->execute([$newVarId, $name, $meta['meta_value']]);
        }
    }
}
echo "  " . (count($variations) - count($orphanVariations)) . " variations (" . count($orphanVariations) . " orphaned, skipped: " . implode(', ', $orphanVariations) . ")\n";

echo "Done.\n";
