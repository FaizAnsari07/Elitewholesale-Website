# Elite Wholesale — local WordPress/WooCommerce admin backend

This is a **local-only, headless** WordPress + WooCommerce instance restored
from the original Elite Wholesale `.wpress` backup. It exists to give you a
real admin backend (add/edit/delete products, categories, brands, media)
backed by the actual recovered product data. It is **not** used to render any
public-facing pages — the Next.js app at the project root is the storefront.

Two separate connections exist between the Next.js app and this backend:

- **Reads** go through [WPGraphQL](https://www.wpgraphql.com/) (`/graphql`) —
  this is what the public site uses to render products/categories/brands.
- **Writes** (from the Next.js app's own `/admin` panel) go through the
  **WooCommerce REST API** (`/wp-json/wc/v3/...`) instead, authenticated with
  a WordPress Application Password. WPGraphQL doesn't support Application
  Password authentication (that's a WordPress core REST API mechanism), so
  mutations use REST while reads stay on GraphQL.

## What was deliberately left out

- **Elementor, Elementor Pro, and every front-end design/marketing plugin**
  (AIOSEO, WP Rocket, Wordfence, chat widgets, jet-menu, etc.) — none of that
  renders anything here, since Next.js is the front end now.
- **Every mu-plugin and several root-level files from the original backup.**
  The original migration audit found multiple 0-byte PHP files with generic
  dropper-style names (`titan-launcher-hq.php`, `bright-toolkit-pad.php`,
  `drift-orchestrator-x.php`, plus hidden `.swm_`/`.sd_`/`.bt_` variants) in
  `mu-plugins/` — which execute automatically with no activation step — along
  with hex-named PHP files and a `.zip` at the webroot. This is a strong
  malware/backdoor signature. **None of it is extracted, present, or
  executed anywhere in this restore.** The original live hosting account
  should be scanned and cleaned by the host/a security professional, and all
  its credentials rotated — that's a separate, real action item outside of
  this migration.
- **Order, customer, and form-submission data** (WooCommerce orders, WCFM,
  WPForms entries, Contact Form 7 leads, Elementor form submissions, Tawk.to
  chat leads) — excluded from the database import entirely; see
  `scripts/filter_sql.py` for the exact table whitelist.
- **The original `wp_users` login data.** The table schema is kept (WordPress
  requires it to exist) but no real account rows are imported — the original
  password hash isn't something we can or should reuse. A fresh local admin
  is created instead (see below).

## Prerequisites

- Docker Desktop
- Python 3
- The original `elitewholesale-online-*.wpress` backup file

## First-time setup

```bash
cd wordpress
cp .env.example .env    # then edit .env with your own local dev passwords
./setup.sh /path/to/elitewholesale-online-*.wpress
```

This extracts the whitelisted plugins/theme/media, imports and cleans the
real product database, starts MariaDB + WordPress in Docker, fixes every
`elitewholesale.online` URL to point at `localhost:8080` (via WP-CLI's
serialization-safe `search-replace`, not a blind text replace — Elementor's
data is PHP-serialized JSON, and a naive replace would corrupt it), activates
WooCommerce + Catalog Mode + WPGraphQL + ACF, and creates a local admin
account.

**wp-admin login:** `http://localhost:8080/wp-admin/` — username `localadmin`,
password `ChangeMe123!` (change this on first login).

**GraphQL endpoint:** `http://localhost:8080/graphql`

**Next.js /admin panel:** the script also prints a WooCommerce REST API
Application Password at the end. Copy the three `WORDPRESS_API_URL` /
`WORDPRESS_APP_USER` / `WORDPRESS_APP_PASSWORD` lines it prints into the
project root's `.env.local`, alongside `ADMIN_USERNAME` / `ADMIN_PASSWORD` /
`ADMIN_SESSION_SECRET` (see the root `.env.example`) to gate the panel itself.
Then visit `http://localhost:3000/admin`.

Application Passwords require either HTTPS or `wp_get_environment_type()`
to report `'local'` (see `wp_is_application_passwords_supported()` in
WordPress core) — that's why `docker-compose.yml` sets
`WP_ENVIRONMENT_TYPE: local` even though this stack runs over plain HTTP.

## Day to day

```bash
docker compose up -d db wordpress   # start
docker compose down                 # stop (keeps the database)
docker compose down -v              # stop and wipe the database (re-run setup.sh after)
docker compose run --rm wpcli wp <command> --allow-root   # any WP-CLI command
```

## Connecting the Next.js app

The Next.js app reads `WORDPRESS_GRAPHQL_URL` (see the project root's
`.env.example`) to fetch live product/category/brand data. With this
backend running on the default port, no configuration is needed beyond
copying `.env.example` to `.env.local` at the project root.

## Deploying for real

This setup is for local development only. Deploying it to real hosting means
choosing a PHP+MySQL/MariaDB host, uploading `wp-content` there, importing
the database, running the same `search-replace` step against your real
domain instead of `localhost:8080`, and pointing the Next.js app's
`WORDPRESS_GRAPHQL_URL` at that domain. Do not reuse the `ChangeMe123!`
password anywhere beyond local development.
