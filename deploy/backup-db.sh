#!/usr/bin/env bash
set -euo pipefail

project_dir="/opt/rpm-rent"
backup_dir="${project_dir}/backups/postgres"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"

umask 077
mkdir -p "${backup_dir}"

cd "${project_dir}"
docker compose --env-file .env.production -f compose.production.yml exec -T db \
  sh -c 'pg_dump --format=custom --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  > "${backup_dir}/rpm-rent-${timestamp}.dump"

find "${backup_dir}" -type f -name 'rpm-rent-*.dump' -mtime +7 -delete

