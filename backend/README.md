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

---

# Production deployment (server + GoDaddy DNS)

Stack: Caddy (automatic HTTPS) -> PHP/Apache API -> MariaDB. Only ports 80 and 443 are public; the
database is only reachable inside Docker. Needs a Linux server with Docker and the Compose plugin.

## 1. DNS (GoDaddy)

GoDaddy -> My Products -> your domain -> DNS -> Add record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `api` | your server's public IPv4 | 1 hour |

That gives you `api.yourdomain.com`. Check it with `nslookup api.yourdomain.com` before continuing
(Caddy can only get the HTTPS certificate once the name points at the server).
Use only the `api` subdomain; leave the site's own DNS records alone for Vercel.

## 2. Server

Open ports 80 and 443 in the server firewall / cloud security group (keep 22 for SSH).

Copy this `backend/` folder to the server (for example `rsync -av --exclude .env --exclude backups backend/ user@SERVER:~/backend/`), then on the server:

    cd ~/backend
    cp .env.production.example .env
    nano .env      # set API_DOMAIN and strong secrets
                   # (generate each with: openssl rand -hex 32)
    docker compose -f docker-compose.prod.yml --env-file .env up -d --build

The first start creates the database and loads the catalog from `db/init/`. Verify:

    curl https://api.yourdomain.com/categories.php

## 3. Vercel

Project -> Settings -> Environment Variables (Production and Preview):

    CATALOG_API_URL = https://api.yourdomain.com
    CATALOG_API_KEY = <same CATALOG_API_KEY as in the server .env>

Then redeploy. The build fetches data from the API, so it must be online first.

## Operating it

- Update after code changes: copy the folder again, then `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`
  (the database is only seeded on a completely empty volume, so your data is safe).
- Logs: `docker compose -f docker-compose.prod.yml logs -f api`
- Backups: `./scripts/backup.sh` writes a database dump and an uploads archive into `backups/`
  (keeps the newest 14). Schedule it, for example `crontab -e`:
  `0 3 * * * cd ~/backend && ./scripts/backup.sh >> backups/backup.log 2>&1`
  and copy `backups/` off the server regularly.
- Restore a database dump: `gunzip -c backups/db-XXXX.sql.gz | docker compose -f docker-compose.prod.yml --env-file .env exec -T db sh -c 'mysql -u root -p"$MARIADB_ROOT_PASSWORD" catalog'`
- Never run `docker compose down -v` in production: it deletes the database and uploaded images.
