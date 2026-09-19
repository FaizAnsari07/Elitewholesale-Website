# Elite Wholesale backend (PHP + MariaDB, Docker)

Plain PHP 8.2 (no framework) REST API on MariaDB. No WordPress.

## Run

    cp .env.example .env      # set real passwords and CATALOG_API_KEY
    docker compose up -d --build

API: http://localhost:8080 · DB (host access): localhost:3307

On the first boot of an empty database volume, `db/init/*.sql` creates the schema and loads the catalog.
To reset to the seed: `docker compose down -v && docker compose up -d --build` (this DELETES all data
edited through the admin panel since the seed).

## Layout

- `public/` web root: `products.php`, `categories.php`, `brands.php` (public reads);
  `admin/*.php` (writes, require header `X-Api-Key`); `admin/upload.php` (image upload); `uploads/` (admin-uploaded images)
- `lib/config.php` DB connection and helpers (outside the web root)
- `db/init/` schema + seed data

## Next.js connection

In the Next.js project's `.env.local`:

    CATALOG_API_URL=http://localhost:8080
    CATALOG_API_KEY=<same as backend/.env>

## Backups

    docker compose exec db sh -c 'mysqldump -u root -p"$MARIADB_ROOT_PASSWORD" catalog' > backup.sql
