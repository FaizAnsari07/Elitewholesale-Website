# WordPress → Plain PHP + MariaDB Backend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the WordPress/WooCommerce backend entirely and replace it with a plain PHP + PDO REST API backed by a clean custom MariaDB schema, migrating all real catalog data (products, variations, categories, brands, images) out of the WooCommerce tables — with zero changes to the Next.js pages/components that already consume `src/lib/wordpress.ts` and `src/lib/woocommerce-admin.ts`, because their exported function names and TypeScript shapes are preserved exactly.

**Architecture:** The existing `wordpress/docker-compose.yml`'s `db` (MariaDB) service and its `db_data` volume are kept untouched — the real data already migrated from the `.wpress` backup lives there and must not be lost. A new `catalog` database is created *alongside* the existing `wordpress` database in that same MariaDB instance. A one-time PHP CLI script (`migrate.php`) reads the WooCommerce tables (`wp_posts`, `wp_postmeta`, `wp_terms`, `wp_term_taxonomy`, `wp_term_relationships`) and writes into the new clean `catalog` tables. The `wordpress` and `wpcli` Docker services are removed and replaced by a single `api` service (`php:8.2-apache` + `pdo_mysql`) serving plain PHP files with no framework. Product/category/brand images are physically copied from `wordpress/wp-content/uploads/` into the Next.js project's `public/uploads/`, so the running site has zero runtime dependency on WordPress or PHP for images. `src/lib/wordpress.ts` and `src/lib/woocommerce-admin.ts` are rewritten (as `src/lib/catalog.ts` and `src/lib/admin-api.ts`) to call the new PHP endpoints instead of WPGraphQL/WooCommerce REST, but export the exact same function names and TypeScript types, so every one of the 25 files that import them needs only an import-path change, not a logic change.

**Tech Stack:** PHP 8.2 + PDO (no framework, per explicit user preference), MariaDB 10.11 (already running), Next.js 16 / TypeScript (existing app, unchanged data-layer contract).

**Spec:** This plan was scoped directly from a live audit of the running Docker WordPress/WooCommerce database (table names, row counts, attribute formats) performed during planning — see the "Source Data Findings" section below, which the plan's migration script (Task 3) argues from.

## Global Constraints

- **Never run `docker compose down -v`** on `wordpress/docker-compose.yml`, and never drop or truncate the `wordpress` database. It is the only copy of the real product data recovered from the original `.wpress` backup. The `db` service definition and `db_data` volume name must not change.
- Keep every exported function name and TypeScript type in `src/lib/wordpress.ts`/`src/lib/woocommerce-admin.ts` identical in their replacements (`src/lib/catalog.ts`/`src/lib/admin-api.ts`), so no consumer file needs logic changes — only the import path.
- Do not invent product/category/brand data. The migration must faithfully carry over what's in the WooCommerce tables, including any pre-existing data-quality oddities (see Finding 3 below) — those get fixed later, by hand, through the now-working admin panel, not silently during migration.
- No real pricing exists anywhere in the source data (see Finding 2) — do not invent prices. Keep `regular_price`/`sale_price` columns for admin-form compatibility only; the public site continues to show `WHOLESALE_PRICE_LABEL`, never a real price.
- Public read endpoints stay unauthenticated (matching today's public WPGraphQL reads); only admin write endpoints require the `X-Api-Key` header (matching today's Application-Password-gated WooCommerce REST writes).

## Source Data Findings (from live DB audit)

1. **220 published products, 1,636 published variations**, taxonomies: `product_cat` (13 real categories), `product_brand` (55 terms — see Finding 3), attribute taxonomies `pa_flavor`/`pa_edition`/`pa_option`/`pa_size` exist but variations actually use free-text postmeta (`attribute_flavor`, `attribute_option`, `attribute_size`, `attribute_strength`, `attribute_flavors`, `attribute_flavor-options` — inconsistent key naming, values are plain display strings like `"Baja Splash"`, not slugs).
2. **No variation has `_price` set** (`SELECT COUNT(*) ... = 0` across all 1,636 published variations). This confirms the site never used real WooCommerce pricing — it's purely an enquiry-based wholesale catalog. Nothing to migrate here beyond the empty/placeholder columns already in `WcProduct`.
3. **Data quality issue in `product_brand` taxonomy, pre-existing in the source, not introduced by this migration:** the top "brands" by product count are `T Shirt` (37), `Click it` (30), `sign` (28), `Glass` (19) — none of these are real vape/smoke-shop brands; they look like leftover demo/theme terms from the original site build, sitting alongside genuine brands (`Pyne Pod`, `Ruthless`, `Geek Bar`, `Off Stamp`, `Lost Marry`, `Dubai Chocolates`, etc.). **This plan migrates them as-is** (faithful migration, per Global Constraints) — flag this to the user after migration so they can delete the bogus terms via the now-functional admin panel.
4. **Only 4 of 220 published products have a missing/broken thumbnail file** on disk (of 660 total attachment DB rows, 375 point to files that no longer exist — but those are unrelated media-library clutter, not live product images). `migrate.php` logs these 4 by product ID instead of failing.
5. Images live under `wordpress/wp-content/uploads/` (81 MB, 307 files) — small enough to copy wholesale into `public/uploads/`.
6. Product attributes (the simple-product "Flavor: A, B, C ..." list) are stored as a PHP-serialized array in `_product_attributes` postmeta, with pipe-delimited (`|`) option strings — PHP's native `unserialize()` handles this directly, no custom parser needed this time.
7. The DB user `wpuser` currently has `GRANT ALL` only on the `wordpress` database, not on the new `catalog` database — Task 1's `schema.sql` includes the missing `GRANT`.
8. Everything else in the app (`src/lib/admin-auth.ts`, `src/proxy.ts`, `src/lib/admin-settings.ts`, the enquiry cart/email flow) is already 100% independent of WordPress — no changes needed there.

---

### Task 1: Database schema for the new `catalog` database

**Files:**
- Create: `wordpress/api/schema.sql`

**Interfaces:**
- Produces: the `catalog` database and 8 tables (`categories`, `brands`, `products`, `product_images`, `product_categories`, `product_brands`, `product_attributes`, `product_variations`, `product_variation_attributes`) that Task 3 (migration) writes into and Tasks 4–5 (PHP API) read/write.

- [ ] **Step 1: Write the schema file**

```sql
-- wordpress/api/schema.sql
CREATE DATABASE IF NOT EXISTS catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON catalog.* TO 'wpuser'@'%';
FLUSH PRIVILEGES;

USE catalog;

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wp_term_id INT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  image_url VARCHAR(500) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS brands (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wp_term_id INT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wp_post_id INT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('simple','variable') NOT NULL DEFAULT 'simple',
  status ENUM('publish','draft') NOT NULL DEFAULT 'publish',
  sku VARCHAR(100) NULL,
  regular_price VARCHAR(20) NULL,
  sale_price VARCHAR(20) NULL,
  description LONGTEXT NULL,
  short_description TEXT NULL,
  stock_status ENUM('instock','outofstock') NOT NULL DEFAULT 'instock',
  image_url VARCHAR(500) NULL,
  image_alt VARCHAR(255) NULL,
  date_created DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_categories (
  product_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_brands (
  product_id INT NOT NULL,
  brand_id INT NOT NULL,
  PRIMARY KEY (product_id, brand_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  options TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_variations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wp_post_id INT NULL,
  product_id INT NOT NULL,
  sku VARCHAR(100) NULL,
  price VARCHAR(20) NULL,
  regular_price VARCHAR(20) NULL,
  stock_status ENUM('instock','outofstock') NOT NULL DEFAULT 'instock',
  image_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_variation_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  variation_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  value VARCHAR(255) NOT NULL,
  FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

- [ ] **Step 2: Apply it against the running `db` container**

Run (from the `wordpress/` directory, with its `.env` sourced):
```bash
set -a; source .env; set +a
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" < api/schema.sql
```
Expected: no error output.

- [ ] **Step 3: Verify the tables exist and the grant took effect**

```bash
docker compose exec -T db mysql -u wpuser -p"$MYSQL_PASSWORD" catalog -e "SHOW TABLES;"
```
Expected: the 9 tables listed (including `catalog` itself implied by connecting to it), no access-denied error.

- [ ] **Step 4: Commit**

```bash
git add wordpress/api/schema.sql
git commit -m "Add catalog database schema for the WordPress replacement backend"
```

---

### Task 2: PHP API container scaffold + Docker Compose rewire

**Files:**
- Create: `wordpress/api/Dockerfile`
- Create: `wordpress/api/config.php`
- Modify: `wordpress/docker-compose.yml`
- Modify: `wordpress/.env` (add `CATALOG_API_KEY`, gitignored — do not commit real value)

**Interfaces:**
- Produces: `db()` (returns a shared `PDO` connected to the `catalog` database), `json_out($data, $status = 200)`, `require_api_key()`, `json_body()` — used by every PHP file in Tasks 4 and 5.

- [ ] **Step 1: Write the Dockerfile**

```dockerfile
# wordpress/api/Dockerfile
FROM php:8.2-apache
RUN docker-php-ext-install pdo_mysql
```

- [ ] **Step 2: Write config.php**

```php
<?php
// wordpress/api/config.php
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
```

- [ ] **Step 3: Rewrite `wordpress/docker-compose.yml`**

Replace the entire `wordpress` and `wpcli` service blocks with a single `api` service. The `db` service and the `volumes:` section stay **exactly as they are** — do not touch the `db_data` volume name or the `db` service definition.

```yaml
services:
  db:
    # The original site's database is MariaDB (confirmed by the AI1WM dump
    # header: "Class: Ai1wm_Database_Mariadb"), which is why some collations
    # in the dump (e.g. utf8mb3_uca1400_ai_ci) aren't recognized by MySQL 8.
    #
    # IMPORTANT: this service and the db_data volume hold the real product
    # catalog migrated from the original .wpress backup, now duplicated into
    # the clean `catalog` schema by wordpress/api/migrate.php. NEVER run
    # `docker compose down -v` here -- it deletes db_data and both the
    # legacy `wordpress` database AND the `catalog` database with it.
    image: mariadb:10.11
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MARIADB_DATABASE: ${MYSQL_DATABASE}
      MARIADB_USER: ${MYSQL_USER}
      MARIADB_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3307:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 20

  api:
    build: ./api
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DB_HOST: db
      DB_PORT: "3306"
      DB_NAME: catalog
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      API_KEY: ${CATALOG_API_KEY}
    volumes:
      - ./api:/var/www/html
    ports:
      - "8080:80"

volumes:
  db_data:
```

- [ ] **Step 4: Add the API key to `wordpress/.env`**

Generate a random key and append it:
```bash
cd wordpress
echo "CATALOG_API_KEY=$(openssl rand -hex 32)" >> .env
```
Expected: `.env` (already gitignored — confirm with `git check-ignore wordpress/.env`) now has a `CATALOG_API_KEY=...` line. Note the value; Task 8 needs the same value in the Next.js `.env.local`.

- [ ] **Step 5: Bring the new stack up**

```bash
cd wordpress
docker compose up -d db api
docker compose ps
```
Expected: both `db` and `api` show as running; no `wordpress`/`wpcli` containers exist anymore (`docker compose ps -a` should not list them once removed from the compose file — running containers from the old service names may need `docker compose rm -f wordpress wpcli` first if they still exist from before this edit).

- [ ] **Step 6: Commit**

```bash
git add wordpress/api/Dockerfile wordpress/api/config.php wordpress/docker-compose.yml
git commit -m "Replace WordPress/WP-CLI Docker services with a plain PHP API service"
```
(`wordpress/.env` is gitignored and is not committed.)

---

### Task 3: Migration script — WooCommerce tables → `catalog` tables + image copy

**Files:**
- Create: `wordpress/api/migrate.php`

**Interfaces:**
- Consumes: the `wordpress` database's `wp_posts`/`wp_postmeta`/`wp_terms`/`wp_term_taxonomy`/`wp_term_relationships` tables (read-only), the `catalog` schema from Task 1.
- Produces: fully populated `catalog` tables; `public/uploads/**` files in the Next.js project.

- [ ] **Step 1: Copy the media files first (outside PHP, plain filesystem copy)**

```bash
cd /Users/origin/Documents/Elitewholesale-Website
mkdir -p public/uploads
cp -R wordpress/wp-content/uploads/. public/uploads/
du -sh public/uploads
```
Expected: `~81M`, matching the source `wordpress/wp-content/uploads` size.

- [ ] **Step 2: Write the migration script**

```php
<?php
// wordpress/api/migrate.php
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
```

- [ ] **Step 3: Run the migration**

```bash
cd wordpress
docker compose run --rm api php migrate.php
```
Expected output ends with: `220 products (N missing a thumbnail file: ...)` where N is small (expect 4, per Finding 4), then a variations line, then `Done.`. No PHP fatal errors.

- [ ] **Step 4: Verify row counts against the source**

```bash
set -a; source .env; set +a
echo "-- source --"
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" wordpress -e "SELECT COUNT(*) FROM wp_posts WHERE post_type='product' AND post_status='publish';"
echo "-- migrated --"
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" catalog -e "SELECT COUNT(*) FROM products;"
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" catalog -e "SELECT COUNT(*) FROM product_variations;"
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" catalog -e "SELECT COUNT(*) FROM categories;"
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" catalog -e "SELECT COUNT(*) FROM brands;"
```
Expected: `products` = 220 (matches source), `categories` = 13, `brands` = 55, `product_variations` close to 1636 minus any orphans reported in Step 3.

- [ ] **Step 5: Spot-check one product's full row + its images resolve on disk**

```bash
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" catalog -e "SELECT id, name, slug, image_url FROM products WHERE slug='spaceman-sp40000-40k'\G"
```
Then confirm the printed `image_url` (e.g. `/uploads/2025/03/xyz.jpg`) exists:
```bash
ls -la /Users/origin/Documents/Elitewholesale-Website/public"$(docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" catalog -N -e "SELECT image_url FROM products WHERE slug='spaceman-sp40000-40k';")"
```
Expected: file exists, non-zero size.

- [ ] **Step 6: Commit**

```bash
git add wordpress/api/migrate.php
git commit -m "Add one-time migration script from WooCommerce tables to the catalog schema"
```
(`public/uploads/` — decide in Task 9 whether to commit the copied images or `.gitignore` them; flag to the user, don't decide silently.)

---

### Task 4: Public PHP read endpoints

**Files:**
- Create: `wordpress/api/products.php`
- Create: `wordpress/api/categories.php`
- Create: `wordpress/api/brands.php`

**Interfaces:**
- Produces: JSON shapes matching `Product`/`Category`/`Brand`/`ProductVariation`/`SearchResult` exactly as `src/lib/catalog.ts` (Task 6) expects them.
- Consumes: `db()` from `config.php` (Task 2).

- [ ] **Step 1: Write `products.php`**

```php
<?php
// wordpress/api/products.php
// GET /products.php              -> { products: Product[] }
// GET /products.php?slug=X       -> { product: Product | null }
// GET /products.php?category=X   -> { products: Product[] }
// GET /products.php?brand=X      -> { products: Product[] }
// GET /products.php?search=X     -> { products: SearchResult[] }
require __DIR__ . '/config.php';

$pdo = db();

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
        $vars = $pdo->prepare("SELECT * FROM product_variations WHERE product_id = ? ORDER BY sort_order");
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
    $stmt = $pdo->prepare("SELECT * FROM products WHERE slug = ? AND status = 'publish' LIMIT 1");
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    json_out(['product' => $row ? hydrate_product($pdo, $row) : null]);
}

if ($category !== null) {
    $stmt = $pdo->prepare("
        SELECT p.* FROM products p
        JOIN product_categories pc ON pc.product_id = p.id
        JOIN categories c ON c.id = pc.category_id
        WHERE c.slug = ? AND p.status = 'publish'
    ");
    $stmt->execute([$category]);
    json_out(['products' => array_map(fn($r) => hydrate_product($pdo, $r), $stmt->fetchAll())]);
}

if ($brand !== null) {
    $stmt = $pdo->prepare("
        SELECT p.* FROM products p
        JOIN product_brands pb ON pb.product_id = p.id
        JOIN brands b ON b.id = pb.brand_id
        WHERE b.slug = ? AND p.status = 'publish'
    ");
    $stmt->execute([$brand]);
    json_out(['products' => array_map(fn($r) => hydrate_product($pdo, $r), $stmt->fetchAll())]);
}

if ($search !== null) {
    $stmt = $pdo->prepare("SELECT slug, name, image_url, image_alt FROM products WHERE status = 'publish' AND name LIKE ? LIMIT 8");
    $stmt->execute(['%' . $search . '%']);
    $rows = $stmt->fetchAll();
    json_out(['products' => array_map(fn($r) => [
        'slug' => $r['slug'],
        'name' => $r['name'],
        'image' => $r['image_url'] ? ['sourceUrl' => $r['image_url'], 'altText' => $r['image_alt'] ?? ''] : null,
    ], $rows)]);
}

$rows = $pdo->query("SELECT * FROM products WHERE status = 'publish'")->fetchAll();
json_out(['products' => array_map(fn($r) => hydrate_product($pdo, $r), $rows)]);
```

- [ ] **Step 2: Write `categories.php`**

```php
<?php
// wordpress/api/categories.php
// GET /categories.php          -> { productCategories: { nodes: Category[] } }
// GET /categories.php?slug=X   -> { productCategory: Category | null }
require __DIR__ . '/config.php';

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

$baseSql = "SELECT c.*, (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) AS product_count FROM categories c";

$slug = $_GET['slug'] ?? null;
if ($slug !== null) {
    $stmt = $pdo->prepare($baseSql . " WHERE c.slug = ?");
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    json_out(['productCategory' => $row ? format_category($row) : null]);
}

$rows = $pdo->query($baseSql)->fetchAll();
json_out(['productCategories' => ['nodes' => array_map('format_category', $rows)]]);
```

- [ ] **Step 3: Write `brands.php`**

```php
<?php
// wordpress/api/brands.php
// GET /brands.php                          -> { productBrands: { nodes: Brand[] } }
// GET /brands.php?slug=X                   -> { productBrand: Brand | null }
// GET /brands.php?slug=X&sample_image=1    -> adds `sampleImage` to the brand
require __DIR__ . '/config.php';

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
        WHERE pb.brand_id = ? AND p.image_url IS NOT NULL
        LIMIT 1
    ");
    $stmt->execute([$brandId]);
    $url = $stmt->fetchColumn();
    return $url === false ? null : $url;
}

$baseSql = "SELECT b.*, (SELECT COUNT(*) FROM product_brands pb WHERE pb.brand_id = b.id) AS product_count FROM brands b";
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
```

- [ ] **Step 4: Smoke-test each endpoint directly with curl**

```bash
curl -s "http://localhost:8080/products.php?slug=spaceman-sp40000-40k" | head -c 500
echo
curl -s "http://localhost:8080/categories.php" | head -c 300
echo
curl -s "http://localhost:8080/brands.php?slug=geek-bar&sample_image=1" | head -c 300
```
Expected: valid JSON in each case, matching the shapes above (e.g. the product response has top-level `product.id`, `product.image.sourceUrl` pointing at `/uploads/...`).

- [ ] **Step 5: Commit**

```bash
git add wordpress/api/products.php wordpress/api/categories.php wordpress/api/brands.php
git commit -m "Add public PHP read endpoints for products, categories, and brands"
```

---

### Task 5: Admin PHP write endpoints (API-key gated)

**Files:**
- Create: `wordpress/api/admin/products.php`
- Create: `wordpress/api/admin/categories.php`
- Create: `wordpress/api/admin/brands.php`

**Interfaces:**
- Produces: JSON shapes matching `WcProduct`/`WcTerm` exactly as `src/lib/admin-api.ts` (Task 7) expects them.
- Consumes: `db()`, `require_api_key()`, `json_body()`, `slugify()` from `config.php`.

- [ ] **Step 1: Write `admin/products.php`**

```php
<?php
// wordpress/api/admin/products.php
// All methods require header: X-Api-Key: <CATALOG_API_KEY>
// GET    ?              -> WcProduct[]        (optional ?search=)
// GET    ?id=N          -> WcProduct
// POST   (JSON body)    -> WcProduct (201)
// PUT    ?id=N (JSON)   -> WcProduct
// DELETE ?id=N          -> { deleted: true }
require __DIR__ . '/../config.php';
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
        INSERT INTO products (name, slug, type, status, sku, regular_price, description, short_description, stock_status, date_created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
    $fields = ['name', 'sku', 'regular_price', 'description', 'short_description', 'status', 'stock_status'];
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
```

- [ ] **Step 2: Write `admin/categories.php`**

```php
<?php
// wordpress/api/admin/categories.php
require __DIR__ . '/../config.php';
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
```

- [ ] **Step 3: Write `admin/brands.php`** (identical CRUD pattern, `brands`/`product_brands`/`brand_id`, no image column)

```php
<?php
// wordpress/api/admin/brands.php
require __DIR__ . '/../config.php';
require_api_key();

$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

function format_brand_term(PDO $pdo, array $row): array {
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

if ($method === 'GET' && $id) {
    $stmt = $pdo->prepare("SELECT * FROM brands WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) json_out(['message' => 'Not found'], 404);
    json_out(format_brand_term($pdo, $row));
}

if ($method === 'GET') {
    $rows = $pdo->query("SELECT * FROM brands ORDER BY name")->fetchAll();
    json_out(array_map(fn($r) => format_brand_term($pdo, $r), $rows));
}

if ($method === 'POST') {
    $body = json_body();
    $name = (string)($body['name'] ?? '');
    $slug = slugify($name) . '-' . substr(md5((string)microtime(true)), 0, 6);
    $pdo->prepare("INSERT INTO brands (name, slug, description) VALUES (?, ?, ?)")
        ->execute([$name, $slug, $body['description'] ?? '']);
    $newId = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM brands WHERE id = ?");
    $stmt->execute([$newId]);
    json_out(format_brand_term($pdo, $stmt->fetch()), 201);
}

if ($method === 'PUT' && $id) {
    $body = json_body();
    $pdo->prepare("UPDATE brands SET name = ?, description = ? WHERE id = ?")
        ->execute([$body['name'] ?? '', $body['description'] ?? '', $id]);
    $stmt = $pdo->prepare("SELECT * FROM brands WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) json_out(['message' => 'Not found'], 404);
    json_out(format_brand_term($pdo, $row));
}

if ($method === 'DELETE' && $id) {
    $pdo->prepare("DELETE FROM brands WHERE id = ?")->execute([$id]);
    json_out(['deleted' => true]);
}

json_out(['message' => 'Bad request'], 400);
```

- [ ] **Step 4: Smoke-test auth + CRUD with curl**

```bash
KEY=$(grep CATALOG_API_KEY wordpress/.env | cut -d= -f2)
# Unauthorized without the key:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/admin/categories.php
# Authorized list:
curl -s -H "X-Api-Key: $KEY" http://localhost:8080/admin/categories.php | head -c 300
# Create + delete a throwaway category:
curl -s -H "X-Api-Key: $KEY" -H "Content-Type: application/json" -X POST -d '{"name":"Test Category","description":"tmp"}' http://localhost:8080/admin/categories.php
```
Expected: first call returns `401`; second returns a JSON array of 13 categories; third returns `201` with the new category's JSON, including a generated `slug`. Manually note its `id` and delete it:
```bash
curl -s -H "X-Api-Key: $KEY" -X DELETE "http://localhost:8080/admin/categories.php?id=<id>"
```

- [ ] **Step 5: Commit**

```bash
git add wordpress/api/admin/
git commit -m "Add API-key-gated admin PHP endpoints for products, categories, and brands"
```

---

### Task 6: Rewrite the public data layer (`src/lib/wordpress.ts` → `src/lib/catalog.ts`)

**Files:**
- Create: `src/lib/catalog.ts`
- Delete: `src/lib/wordpress.ts` (after Task 8 repoints every import)

**Interfaces:**
- Produces (unchanged from `wordpress.ts`): `ProductTerm`, `ProductVariation`, `Product`, `Category`, `Brand`, `SearchResult` types; `getAllProducts()`, `getProductBySlug(slug)`, `getProductsByCategory(slug)`, `getProductsByBrand(slug)`, `getAllCategories()`, `getCategoryBySlug(slug)`, `getAllBrands()`, `getBrandBySlug(slug)`, `getBrandSampleImage(slug)`, `searchProducts(query)`.
- Consumes: `wordpress/api/products.php`, `categories.php`, `brands.php` (Task 4) via `CATALOG_API_URL`.

- [ ] **Step 1: Write `src/lib/catalog.ts`**

```typescript
import "server-only";

const CATALOG_API_URL = process.env.CATALOG_API_URL || "http://localhost:8080";

// Revalidate every 60s so admin edits show up on the site without a rebuild.
const REVALIDATE_SECONDS = 60;

async function apiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${CATALOG_API_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`Catalog API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export type ProductTerm = { name: string; slug: string };

export type ProductVariation = {
  id: string;
  sku: string | null;
  price: string | null;
  regularPrice: string | null;
  stockStatus: string | null;
  attributes: { nodes: { name: string; value: string }[] };
  image: { sourceUrl: string } | null;
};

export type Product = {
  id: string;
  databaseId: number;
  slug: string;
  name: string;
  date: string | null;
  description: string | null;
  shortDescription: string | null;
  image: { sourceUrl: string; altText: string } | null;
  galleryImages: { nodes: { sourceUrl: string }[] };
  productCategories: { nodes: ProductTerm[] };
  productBrands: { nodes: ProductTerm[] };
  sku?: string | null;
  stockStatus?: string | null;
  price?: string | null;
  regularPrice?: string | null;
  variations?: { nodes: ProductVariation[] } | null;
  attributes?: { nodes: { name: string; options: string[] }[] } | null;
};

export type Category = {
  databaseId: number;
  name: string;
  slug: string;
  count: number | null;
  description: string | null;
  image: { sourceUrl: string } | null;
};

export type Brand = {
  databaseId: number;
  name: string;
  slug: string;
  count: number | null;
};

export async function getAllProducts(): Promise<Product[]> {
  const data = await apiGet<{ products: Product[] }>("/products.php");
  return data.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const data = await apiGet<{ product: Product | null }>("/products.php", { slug });
  return data.product;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const data = await apiGet<{ products: Product[] }>("/products.php", { category: slug });
  return data.products;
}

export async function getProductsByBrand(slug: string): Promise<Product[]> {
  const data = await apiGet<{ products: Product[] }>("/products.php", { brand: slug });
  return data.products;
}

// Categories intentionally hidden site-wide (requested removal), independent
// of what actually exists in the database.
const HIDDEN_CATEGORY_SLUGS = new Set(["uncategorized", "kratom-extract-supplements"]);

export async function getAllCategories(): Promise<Category[]> {
  const data = await apiGet<{ productCategories: { nodes: Category[] } }>("/categories.php");
  return data.productCategories.nodes.filter((c) => !HIDDEN_CATEGORY_SLUGS.has(c.slug));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const data = await apiGet<{ productCategory: Category | null }>("/categories.php", { slug });
  return data.productCategory;
}

export async function getAllBrands(): Promise<Brand[]> {
  const data = await apiGet<{ productBrands: { nodes: Brand[] } }>("/brands.php");
  return data.productBrands.nodes.filter((b) => b.slug !== "uncategorized");
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const data = await apiGet<{ productBrand: Brand | null }>("/brands.php", { slug });
  return data.productBrand;
}

// A lightweight product image for brand cards -- avoids pulling the full
// product list just to show a thumbnail.
export async function getBrandSampleImage(slug: string): Promise<string | null> {
  const data = await apiGet<{ productBrand: (Brand & { sampleImage: string | null }) | null }>(
    "/brands.php",
    { slug, sample_image: "1" },
  );
  return data.productBrand?.sampleImage ?? null;
}

export type SearchResult = {
  slug: string;
  name: string;
  image: { sourceUrl: string; altText: string } | null;
};

// Lightweight product-name search for the header search box.
export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await apiGet<{ products: SearchResult[] }>("/products.php", { search: query });
  return data.products;
}
```

- [ ] **Step 2: Verify it type-checks in isolation**

```bash
npx tsc --noEmit 2>&1 | grep catalog.ts
```
Expected: no output (file not referenced yet until Task 8, so no errors possible from this file alone; this just confirms no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add src/lib/catalog.ts
git commit -m "Add catalog.ts: PHP-API-backed replacement for the WPGraphQL data layer"
```

---

### Task 7: Rewrite the admin data layer (`src/lib/woocommerce-admin.ts` → `src/lib/admin-api.ts`)

**Files:**
- Create: `src/lib/admin-api.ts`
- Delete: `src/lib/woocommerce-admin.ts` (after Task 8 repoints every import)

**Interfaces:**
- Produces (unchanged from `woocommerce-admin.ts`): `WcProduct`, `WcTerm` types; `listProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`, `listCategories`, `getCategory`, `createCategory`, `updateCategory`, `deleteCategory`, `listBrands`, `getBrand`, `createBrand`, `updateBrand`, `deleteBrand`.
- Consumes: `wordpress/api/admin/products.php`, `admin/categories.php`, `admin/brands.php` (Task 5) via `CATALOG_API_URL` + `CATALOG_API_KEY`.

- [ ] **Step 1: Write `src/lib/admin-api.ts`**

```typescript
import "server-only";

function baseUrl(): string {
  const url = process.env.CATALOG_API_URL;
  if (!url) throw new Error("CATALOG_API_URL is not set");
  return url.replace(/\/$/, "");
}

function apiKey(): string {
  const key = process.env.CATALOG_API_KEY;
  if (!key) throw new Error("CATALOG_API_KEY is not set");
  return key;
}

async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; searchParams?: Record<string, string> } = {},
): Promise<T> {
  const url = new URL(`${baseUrl()}${path}`);
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      "X-Api-Key": apiKey(),
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data as T;
}

// ---- Products ----

export type WcProduct = {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable" | "grouped" | "external";
  status: "publish" | "draft" | "pending" | "private";
  sku: string;
  regular_price: string;
  sale_price: string;
  price: string;
  stock_status: "instock" | "outofstock" | "onbackorder";
  description: string;
  short_description: string;
  categories: { id: number; name: string; slug: string }[];
  brands?: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; alt: string }[];
  date_created: string;
};

export function listProducts(params: { search?: string } = {}): Promise<WcProduct[]> {
  return apiFetch<WcProduct[]>("/admin/products.php", {
    searchParams: params.search ? { search: params.search } : {},
  });
}

export function getProduct(id: number) {
  return apiFetch<WcProduct>("/admin/products.php", { searchParams: { id: String(id) } });
}

export function createProduct(data: Partial<WcProduct>) {
  return apiFetch<WcProduct>("/admin/products.php", { method: "POST", body: data });
}

export function updateProduct(id: number, data: Partial<WcProduct>) {
  return apiFetch<WcProduct>("/admin/products.php", {
    method: "PUT",
    searchParams: { id: String(id) },
    body: data,
  });
}

export function deleteProduct(id: number) {
  return apiFetch<{ deleted: boolean }>("/admin/products.php", {
    method: "DELETE",
    searchParams: { id: String(id) },
  });
}

// ---- Categories ----

export type WcTerm = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image: { id: number; src: string } | null;
};

export function listCategories() {
  return apiFetch<WcTerm[]>("/admin/categories.php");
}

export function getCategory(id: number) {
  return apiFetch<WcTerm>("/admin/categories.php", { searchParams: { id: String(id) } });
}

export function createCategory(data: { name: string; description?: string }) {
  return apiFetch<WcTerm>("/admin/categories.php", { method: "POST", body: data });
}

export function updateCategory(id: number, data: Partial<{ name: string; description: string }>) {
  return apiFetch<WcTerm>("/admin/categories.php", {
    method: "PUT",
    searchParams: { id: String(id) },
    body: data,
  });
}

export function deleteCategory(id: number) {
  return apiFetch<{ deleted: boolean }>("/admin/categories.php", {
    method: "DELETE",
    searchParams: { id: String(id) },
  });
}

// ---- Brands ----

export function listBrands() {
  return apiFetch<WcTerm[]>("/admin/brands.php");
}

export function getBrand(id: number) {
  return apiFetch<WcTerm>("/admin/brands.php", { searchParams: { id: String(id) } });
}

export function createBrand(data: { name: string; description?: string }) {
  return apiFetch<WcTerm>("/admin/brands.php", { method: "POST", body: data });
}

export function updateBrand(id: number, data: Partial<{ name: string; description: string }>) {
  return apiFetch<WcTerm>("/admin/brands.php", {
    method: "PUT",
    searchParams: { id: String(id) },
    body: data,
  });
}

export function deleteBrand(id: number) {
  return apiFetch<{ deleted: boolean }>("/admin/brands.php", {
    method: "DELETE",
    searchParams: { id: String(id) },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/admin-api.ts
git commit -m "Add admin-api.ts: PHP-API-backed replacement for the WooCommerce REST admin client"
```

---

### Task 8: Repoint every import, update env vars and `next.config.ts`

**Files:**
- Modify (import path only, mechanical): all 25 files found in the audit below
- Modify: `.env.local`
- Modify: `next.config.ts`
- Delete: `src/lib/wordpress.ts`, `src/lib/woocommerce-admin.ts`

**Interfaces:**
- Consumes: `src/lib/catalog.ts` (Task 6), `src/lib/admin-api.ts` (Task 7).

- [ ] **Step 1: List every current import site (already audited; re-run to confirm nothing changed)**

```bash
grep -rln "@/lib/wordpress\|@/lib/woocommerce-admin" src/
```
Expected (25 files):
```
src/app/(site)/brand/[slug]/page.tsx
src/app/(site)/brands/page.tsx
src/app/(site)/categories/page.tsx
src/app/(site)/page.tsx
src/app/(site)/product-category/[slug]/page.tsx
src/app/(site)/product/[slug]/page.tsx
src/app/(site)/shop/page.tsx
src/app/admin/(dashboard)/brands/[id]/edit/page.tsx
src/app/admin/(dashboard)/brands/page.tsx
src/app/admin/(dashboard)/categories/[id]/edit/page.tsx
src/app/admin/(dashboard)/categories/page.tsx
src/app/admin/(dashboard)/page.tsx
src/app/admin/(dashboard)/products/[id]/edit/page.tsx
src/app/admin/(dashboard)/products/[id]/page.tsx
src/app/admin/(dashboard)/products/new/page.tsx
src/app/admin/(dashboard)/products/page.tsx
src/app/admin/actions.ts
src/app/api/search/route.ts
src/app/sitemap.ts
src/components/Header.tsx
src/components/HeaderClient.tsx
src/components/ProductCard.tsx
src/components/ProductEnquirySelector.tsx
src/components/SearchBox.tsx
src/components/admin/ProductForm.tsx
src/components/admin/TermForm.tsx
```

- [ ] **Step 2: Mechanically repoint imports**

```bash
grep -rl "@/lib/wordpress" src/ | xargs sed -i '' 's#@/lib/wordpress#@/lib/catalog#g'
grep -rl "@/lib/woocommerce-admin" src/ | xargs sed -i '' 's#@/lib/woocommerce-admin#@/lib/admin-api#g'
```
(`sed -i ''` is the macOS/BSD form used elsewhere in this shell; matches this machine's `sed`.)

- [ ] **Step 3: Delete the old lib files**

```bash
git rm src/lib/wordpress.ts src/lib/woocommerce-admin.ts
```

- [ ] **Step 4: Update `next.config.ts`** — images are now local to `public/uploads/`, so the WordPress remote-pattern allowlist is no longer needed

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 5: Update `.env.local`** — remove the four `WORDPRESS_*` vars, add two `CATALOG_*` vars (use the exact value generated in Task 2 Step 4 for the key)

```
CATALOG_API_URL=http://localhost:8080
CATALOG_API_KEY=<same value as wordpress/.env's CATALOG_API_KEY>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=A8CIF7uoNy72mJho
ADMIN_SESSION_SECRET=d345da55177133ed3b05dddd7eda84a98f5cebf665a2532681351915740589e4
```
(Keep the existing `ADMIN_*` vars exactly as they are — they gate the custom admin-panel login, already fully independent of WordPress.)

- [ ] **Step 6: Type-check and lint the whole repo**

```bash
npx tsc --noEmit
npx eslint .
```
Expected: no errors. If `tsc` reports anything, it will be a genuine leftover reference to a removed export (e.g. `databaseId` usage that doesn't exist in a new type) — fix by comparing against the type definition in `src/lib/catalog.ts`/`src/lib/admin-api.ts`, not by re-adding WordPress-specific fields.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Repoint all imports from the WordPress data layer to the new PHP-backed catalog/admin-api"
```

---

### Task 9: End-to-end verification against the live stack

**Files:** none (verification only)

- [ ] **Step 1: Confirm the stack is running with no WordPress containers**

```bash
cd wordpress && docker compose ps
```
Expected: only `db` and `api` listed. No `wordpress` or `wpcli` container.

- [ ] **Step 2: Production build**

```bash
cd /Users/origin/Documents/Elitewholesale-Website
npm run build
```
Expected: builds cleanly, same route list as before (minus any WordPress-specific remote-image warnings).

- [ ] **Step 3: Start the dev server and smoke-test every page type**

```bash
(lsof -i :3000 -t | xargs -r kill) 2>/dev/null
nohup npm run dev > /tmp/nextdev.log 2>&1 &
sleep 6
for p in / /shop /categories /brands /contact-us /product/spaceman-sp40000-40k /product-category/disposable-vapes /brand/geek-bar /enquiry; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$p")
  echo "$p -> $code"
done
```
Expected: every path returns `200`.

- [ ] **Step 4: Confirm images actually render from `/uploads/...`, not a broken WordPress URL**

```bash
curl -s http://localhost:3000/product/spaceman-sp40000-40k | grep -o '/uploads/[^"]*' | head -3
```
Expected: at least one `/uploads/...` path printed (not `localhost:8080/wp-content/...`).

- [ ] **Step 5: Admin panel end-to-end smoke test**

```bash
# Log in, capture the session cookie
curl -s -c /tmp/admin_cookies.txt -X POST http://localhost:3000/admin/login \
  -d "username=admin&password=A8CIF7uoNy72mJho&from=/admin" -L -o /dev/null -w "%{http_code}\n"
# Load the products list through that session
curl -s -b /tmp/admin_cookies.txt -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/products
```
Expected: both `200`. Then manually verify in a browser: create a test category via `/admin/categories/new`, confirm it appears in the table, edit it, delete it — full CRUD round-trip against the new PHP backend.

- [ ] **Step 6: Check dev server log for any runtime errors**

```bash
tail -40 /tmp/nextdev.log
```
Expected: no thrown errors, no `Catalog API request failed`.

- [ ] **Step 7: Stop the dev server**

```bash
lsof -i :3000 -t | xargs -r kill 2>/dev/null
```

---

### Task 10: Safe decommission notes (no destructive action taken automatically)

**Files:**
- Modify: `wordpress/docker-compose.yml` (comment only, already added in Task 2 Step 3)

- [ ] **Step 1: Confirm nothing was deleted**

```bash
docker volume ls | grep wordpress
ls wordpress/wp-content/uploads | head -3
```
Expected: the `wordpress_db_data` volume still exists (untouched, per Global Constraints), and `wordpress/wp-content/uploads/` still exists on disk as the historical source (now also copied into `public/uploads/`).

- [ ] **Step 2: Report open decisions back to the user instead of deciding silently**

At the end of this plan's execution, surface these to the user (do not resolve unilaterally):
1. Whether to commit `public/uploads/` (81 MB of binary images) to git, or add it to `.gitignore` and document that it must be regenerated via Task 3 Step 1 on a fresh checkout/deploy.
2. The pre-existing bogus `product_brand` terms found in Finding 3 (`T Shirt`, `Click it`, `sign`, and others) — now deletable through the working `/admin/brands` page.
3. Whether the legacy `wordpress` database and `wordpress/wp-content/` folder should be kept indefinitely as a cold backup, or archived/removed later once the user has verified the new catalog data for a while — **not something to decide automatically**.

- [ ] **Step 3: Final commit if anything was left uncommitted**

```bash
git status --short
```
Expected: clean, or only the `public/uploads/` question from Step 2.1 pending a decision.
