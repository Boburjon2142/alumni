#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

archive=$(realpath "${1:?Usage: bash deploy.sh release.tar.gz [project-directory]}")
project=$(realpath "${2:-/var/www/alumni}")
[[ -f "$archive" && -f "$project/docker-compose.yml" && -f "$project/.env" ]] || {
  echo "Release, existing docker-compose.yml and server .env are required." >&2; exit 1;
}
command -v docker >/dev/null
docker compose version >/dev/null
cd "$project"
# This updates the existing Compose project, retaining its named database/media volumes.
docker compose config --quiet
backend_id=$(docker compose ps -q backend)
frontend_id=$(docker compose ps -q frontend)
[[ -n "$backend_id" && -n "$frontend_id" ]] || { echo "Existing backend/frontend must be running." >&2; exit 1; }
engine=$(docker compose exec -T backend python manage.py shell -c 'from django.conf import settings; print(settings.DATABASES["default"]["ENGINE"])' | tail -n 1)
[[ "$engine" == "django.db.backends.postgresql" ]] || { echo "This updater requires PostgreSQL. SQLite deployment needs a separate backup procedure." >&2; exit 1; }

stamp=$(date +%Y%m%d-%H%M%S)
backup="$HOME/alumni-backups/$stamp"
mkdir -p "$backup"
printf '%s\n' "$project" > "$backup/project-path.txt"
docker inspect "$backend_id" --format '{{.Image}}' > "$backup/backend-image.txt"
docker inspect "$frontend_id" --format '{{.Image}}' > "$backup/frontend-image.txt"
docker image tag "$(cat "$backup/backend-image.txt")" "alumni-backend-rollback:$stamp"
docker image tag "$(cat "$backup/frontend-image.txt")" "alumni-frontend-rollback:$stamp"
printf 'services:\n  backend:\n    image: alumni-backend-rollback:%s\n  frontend:\n    image: alumni-frontend-rollback:%s\n' "$stamp" "$stamp" > "$backup/rollback-images.yml"
tar --exclude='./.git' --exclude='./frontend/node_modules' --exclude='./frontend/.next' \
  --exclude='./frontend/.next-build' --exclude='./backend/venv' --exclude='./tmp' \
  -czf "$backup/source.tar.gz" -C "$project" .

# Reject unsafe archive paths before extracting anything.
while IFS= read -r entry; do
  case "$entry" in /*|../*|*/../*|.env|backend/.env|frontend/.env*) echo "Unsafe archive entry: $entry" >&2; exit 1;; esac
done < <(tar -tzf "$archive")
tar -xzf "$archive" -C "$project"
cp scripts/rollback.sh "$backup/rollback.sh"
echo "Backup: $backup"
stopped=false
recover() {
  local result=$?
  trap - ERR
  echo "Deployment failed. Restoring previous source and application images." >&2
  if [[ "$stopped" == true ]]; then
    bash "$backup/rollback.sh" "$backup" "$project" || echo "Automatic recovery failed; use $backup/rollback.sh manually." >&2
  else
    tar -xzf "$backup/source.tar.gz" -C "$project"
  fi
  exit "$result"
}
trap recover ERR

# Fail before downtime if required secrets or build configuration are missing.
docker compose config --quiet
docker compose build backend frontend
docker compose up -d --wait db redis
docker compose run --rm --no-deps backend python manage.py check
docker compose run --rm --no-deps backend python manage.py shell -c \
  'from apps.alumni.models import AlumniProfile; from django.db.models import Count; duplicates=AlumniProfile.objects.values("full_name").annotate(n=Count("id")).filter(n__gt=1).count(); assert duplicates == 0, "Duplicate profile names must be resolved before the unique-name migration"'

stopped=true
docker compose stop frontend backend
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$backup/database.sql"
test -s "$backup/database.sql"
mkdir -p "$backup/media"
docker cp "$backend_id:/app/media/." "$backup/media/"
docker compose run --rm --no-deps backend python manage.py migrate --noinput
docker compose run --rm --no-deps backend python manage.py collectstatic --noinput
docker compose run --rm --no-deps backend python manage.py shell -c 'from django.core.cache import cache; cache.clear()'
docker compose up -d --no-build backend frontend

for attempt in $(seq 1 30); do
  if curl --max-time 10 -fsS http://127.0.0.1:8005/api/v1/alumni/groups/ >/dev/null && \
     curl --max-time 10 -fsS http://127.0.0.1:3005/groups >/dev/null; then
    docker compose ps
    echo "Deployment completed. Backup and rollback script: $backup"
    exit 0
  fi
  sleep 2
done
echo "Health check failed." >&2
false
