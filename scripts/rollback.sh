#!/usr/bin/env bash
set -Eeuo pipefail
backup=$(realpath "${1:?Usage: bash rollback.sh backup-directory [project-directory]}")
project=$(realpath "${2:-$(cat "$backup/project-path.txt")}")
test -s "$backup/source.tar.gz"
test -s "$backup/rollback-images.yml"
tar -xzf "$backup/source.tar.gz" -C "$project"
cd "$project"
docker compose -f docker-compose.yml -f "$backup/rollback-images.yml" up -d --no-build --force-recreate backend frontend
echo "Previous code/images restored. Database and media retained; no destructive schema downgrade performed."
