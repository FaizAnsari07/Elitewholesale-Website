#!/usr/bin/env bash
# Dumps the database and uploaded images into ./backups (keeps the newest 14 of each).
set -euo pipefail
cd "$(dirname "$0")/.."
COMPOSE="docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE:-.env}"
STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p backups
$COMPOSE exec -T db sh -c 'mysqldump -u root -p"$MARIADB_ROOT_PASSWORD" --single-transaction catalog' | gzip > "backups/db-$STAMP.sql.gz"
$COMPOSE exec -T api tar -C /var/www/public -czf - uploads > "backups/uploads-$STAMP.tar.gz"
ls -1t backups/db-*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --
ls -1t backups/uploads-*.tar.gz 2>/dev/null | tail -n +15 | xargs -r rm --
echo "Backup written: backups/db-$STAMP.sql.gz, backups/uploads-$STAMP.tar.gz"
