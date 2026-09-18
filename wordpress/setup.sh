#!/usr/bin/env bash
# Restores a local, headless WordPress + WooCommerce backend from the
# original Elite Wholesale All-in-One WP Migration backup, for use as the
# product/category/brand admin behind the Next.js site.
#
# Deliberately excludes:
#  - Elementor/Elementor Pro and all front-end design plugins (not needed --
#    Next.js is the front end now).
#  - Every mu-plugin and root-level file from the original backup: several
#    were identified as likely malware/backdoors during the original
#    migration audit (0-byte files with generic dropper-style names such as
#    "titan-launcher-hq", hidden dotfiles, hex-named root PHP files). None of
#    that is extracted or executed.
#  - Wordfence logs, Revolution Slider, and all order/customer/form-entry
#    tables (PII) from the database import -- see scripts/filter_sql.py for
#    the exact table whitelist.
#  - The original wp_users/wp_usermeta *data* (schema is kept, WordPress
#    requires the tables to exist, but real account data is never imported;
#    a fresh local admin is created instead, since the original password
#    hash isn't usable anyway).
#
# Usage: ./setup.sh /path/to/elitewholesale-online-*.wpress
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

WPRESS_FILE="${1:-}"
if [ -z "$WPRESS_FILE" ] || [ ! -f "$WPRESS_FILE" ]; then
  echo "Usage: $0 /path/to/elitewholesale-online-*.wpress" >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo ".env not found -- copy .env.example to .env and set real local passwords first." >&2
  exit 1
fi
set -a; source .env; set +a

WP() { docker compose run --rm wpcli wp "$@" --allow-root; }

echo "==> Extracting whitelisted plugins/theme from the backup"
python3 scripts/extract_wpress.py "$WPRESS_FILE" ./wp-content \
  --only "plugins/woocommerce/" \
  --only "plugins/woocommerce-catalog-mode/" \
  --only "plugins/wp-graphql/" \
  --only "plugins/wp-graphql-woocommerce/" \
  --only "plugins/wpgraphql-acf/" \
  --only "plugins/advanced-custom-fields/" \
  --only "themes/hello-elementor/" \
  --only "themes/index.php" \
  --only "plugins/index.php"

echo "==> Extracting curated product/category/brand media (see scripts/media-manifest.txt)"
rm -rf /tmp/ew-media-extract && mkdir -p /tmp/ew-media-extract
python3 - "$WPRESS_FILE" <<'PYEOF'
import subprocess, sys
files = open('scripts/media-manifest.txt').read().splitlines()
cmd = ['python3', 'scripts/extract_wpress.py', sys.argv[1], '/tmp/ew-media-extract']
for f in files:
    cmd += ['--only', f]
subprocess.run(cmd, check=True)
PYEOF
mkdir -p ./wp-content/uploads
cp -R /tmp/ew-media-extract/uploads/* ./wp-content/uploads/
rm -rf /tmp/ew-media-extract

echo "==> Extracting, cleaning, and filtering the database dump"
mkdir -p db-init
rm -rf /tmp/ew-db-extract && mkdir -p /tmp/ew-db-extract
python3 - "$WPRESS_FILE" <<'PYEOF'
import sys
sys.path.insert(0, 'scripts')
from extract_wpress import extract
extract(sys.argv[1], '/tmp/ew-db-extract', only_prefixes=['./database.sql'])
PYEOF
sed 's/SERVMASK_PREFIX_/wp_/g' /tmp/ew-db-extract/database.sql > /tmp/ew-db-extract/prefixed.sql
python3 scripts/filter_sql.py /tmp/ew-db-extract/prefixed.sql db-init/wordpress-import.sql
rm -rf /tmp/ew-db-extract

echo "==> Starting MariaDB + WordPress containers"
# The original site runs MariaDB (confirmed by the AI1WM dump header), which
# is why the db service uses mariadb rather than mysql -- MySQL 8 rejects a
# few of the dump's newer MariaDB-only collations.
docker compose up -d db wordpress
echo "Waiting for the database to be healthy..."
until [ "$(docker compose ps -q db | xargs docker inspect -f '{{.State.Health.Status}}')" = "healthy" ]; do
  sleep 2
done
# Give WordPress a moment to seed its core files into the shared wp_core volume.
sleep 5

echo "==> Importing the real Elite Wholesale product database"
docker compose exec db mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS $MYSQL_DATABASE; CREATE DATABASE $MYSQL_DATABASE;"
docker compose exec db mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SET GLOBAL sql_mode='NO_ENGINE_SUBSTITUTION';"
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < db-init/wordpress-import.sql

echo "==> Fixing serialized URLs (elitewholesale.online -> localhost:8080) via WP-CLI"
WP search-replace 'https://elitewholesale.online' 'http://localhost:8080' --all-tables
WP option update siteurl 'http://localhost:8080'
WP option update home 'http://localhost:8080'

echo "==> Activating plugins (in dependency order) and the theme"
WP plugin activate woocommerce
WP plugin activate advanced-custom-fields
WP plugin activate woocommerce-catalog-mode
WP plugin activate wp-graphql
WP plugin activate wp-graphql-woocommerce
WP plugin activate wpgraphql-acf
WP theme activate hello-elementor

echo "==> Setting permalinks to match the original site (/%postname%/)"
WP rewrite structure '/%postname%/'
WP rewrite flush

echo "==> Creating a fresh local admin login"
WP user create localadmin admin@localhost.test --role=administrator --user_pass="ChangeMe123!" || \
  WP user update localadmin --user_pass="ChangeMe123!"

cat <<'EOF'

==> Done.

wp-admin:   http://localhost:8080/wp-admin/
Username:   localadmin
Password:   ChangeMe123!  (change this immediately after first login)

WPGraphQL endpoint: http://localhost:8080/graphql

Run `docker compose down` (from this directory) to stop the stack, or
`docker compose down -v` to also wipe the database and start over.
EOF
