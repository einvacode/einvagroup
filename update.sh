#!/bin/bash
# ==============================================================================
# Safe deploy script for Einva Group
# - update via Git
# - install deps with lockfile
# - validate Prisma schema
# - build before service restart
# - verify app HTTP is responding
# ==============================================================================

set -Eeuo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { printf '%b\n' "$1"; }
fail() { log "${RED}[ERROR] $1${NC}"; exit 1; }

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

log "${BLUE}=== Memulai proses update Einva Group ===${NC}"

if [ ! -f package.json ]; then
  fail "package.json tidak ditemukan di $APP_DIR"
fi

# Backup DB and uploaded files before git pull
mkdir -p backups
DB_BACKUP=""
UPLOADS_BACKUP=""

if [ -f "prisma/dev.db" ]; then
  DB_BACKUP="backups/dev_db_backup_$(date +%Y%m%d_%H%M%S).db"
  cp "prisma/dev.db" "$DB_BACKUP"
  log "${YELLOW}[INFO] Backup database dibuat: $DB_BACKUP${NC}"
fi

if [ -d "public/uploads" ]; then
  UPLOADS_BACKUP="backups/uploads_backup_$(date +%Y%m%d_%H%M%S)"
  cp -a "public/uploads" "$UPLOADS_BACKUP"
  log "${YELLOW}[INFO] Backup file upload dibuat: $UPLOADS_BACKUP${NC}"
fi

# Update source code
if [ -d .git ]; then
  log "${YELLOW}[STEP 1/6] Pull kode terbaru dari Git...${NC}"
  git fetch --all --prune
  branch="$(git branch --show-current 2>/dev/null || true)"
  if [ -n "$branch" ] && git rev-parse --verify "$branch" >/dev/null 2>&1; then
    git pull --ff-only origin "$branch" || git pull --ff-only
  else
    git pull --ff-only origin main || git pull --ff-only
  fi
else
  log "${YELLOW}[INFO] Folder ini bukan repo Git; lewati pull${NC}"
fi

# Restore uploaded assets if they were backed up and the repo doesn't include them
if [ -n "$UPLOADS_BACKUP" ] && [ -d "$UPLOADS_BACKUP" ]; then
  mkdir -p public
  rm -rf public/uploads
  cp -a "$UPLOADS_BACKUP" public/uploads
  log "${YELLOW}[INFO] File upload berhasil dikembalikan ke public/uploads${NC}"
fi

# Install dependencies with lockfile for reproducible builds
log "${YELLOW}[STEP 2/6] Install dependency...${NC}"
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

# Prisma validation
log "${YELLOW}[STEP 3/6] Generate Prisma client...${NC}"
npx prisma generate

log "${YELLOW}[STEP 4/6] Sinkronisasi database Prisma...${NC}"
if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  npx prisma db push --skip-generate
fi

# Build must succeed before restart
log "${YELLOW}[STEP 5/6] Build produksi Next.js...${NC}"
npm run build

# Restart app only after successful build
log "${YELLOW}[STEP 6/6] Restart service systemd...${NC}"
if systemctl list-unit-files --type=service | grep -q '^einvagroup.service'; then
  systemctl restart einvagroup.service
elif systemctl list-unit-files --type=service | grep -q '^projekerja.service'; then
  systemctl restart projekerja.service
else
  fail "Service systemd tidak ditemukan. Periksa nama unit service di server."
fi

systemctl is-active --quiet einvagroup.service || systemctl is-active --quiet projekerja.service || fail "Service tidak aktif setelah restart."

log "${YELLOW}[INFO] Menunggu aplikasi siap...${NC}"
for i in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3000 >/dev/null 2>&1; then
    log "${GREEN}=== Update selesai. Aplikasi merespons HTTP 200 di http://127.0.0.1:3000 ===${NC}"
    exit 0
  fi
  sleep 2
done

fail "Aplikasi gagal merespons HTTP setelah restart. Cek log systemctl dan build."
