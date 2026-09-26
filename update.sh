#!/bin/bash
# ==============================================================================
# Script Update Einva Group untuk Proxmox LXC (Debian / Ubuntu)
# ==============================================================================

set -e

# Warna terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUKSES]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [ "$(id -u)" -ne 0 ]; then
    log_error "Harap jalankan script ini sebagai root atau dengan sudo!"
    exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

log_info "Memulai proses pembaruan Einva Group..."

# Backup database sebelum update
if [ -f "$APP_DIR/prisma/dev.db" ]; then
    mkdir -p "$APP_DIR/backups"
    BACKUP_FILE="$APP_DIR/backups/dev_db_backup_$(date +%Y%m%d_%H%M%S).db"
    cp "$APP_DIR/prisma/dev.db" "$BACKUP_FILE"
    log_success "Database berhasil di-backup ke: $BACKUP_FILE"
fi

# Pull git jika merupakan repository git
if [ -d ".git" ]; then
    log_info "Mengambil update terbaru dari Git repository..."
    git pull || echo "Gagal melakukan git pull, melanjutkan update lokal..."
fi

log_info "Menginstal dependensi terbaru..."
npm install

log_info "Memperbarui Prisma Client & Database Schema..."
npx prisma generate
npx prisma db push --skip-generate

log_info "Melakukan build ulang Next.js..."
npm run build

log_info "Merestart service einvagroup..."
if systemctl list-unit-files | grep -q "einvagroup.service"; then
    systemctl restart einvagroup
else
    systemctl restart projekerja
fi

sleep 2
if systemctl is-active --quiet einvagroup || systemctl is-active --quiet projekerja; then
    log_success "Pembaruan berhasil dan aplikasi kembali berjalan normal!"
else
    log_error "Service gagal di-restart. Cek log dengan: journalctl -u einvagroup -n 50 --no-pager"
fi
