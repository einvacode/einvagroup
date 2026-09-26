#!/bin/bash
# ==============================================================================
# Script Update Einva Group untuk Proxmox LXC (Debian / Ubuntu)
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo -e "${BLUE}=== Memulai Pembaruan Einva Group ===${NC}"

# 1. Amankan file database lokal agar tidak konflik dengan Git
if [ -f "prisma/dev.db" ]; then
    mkdir -p backups
    cp prisma/dev.db "backups/dev_db_backup_$(date +%Y%m%d_%H%M%S).db"
fi

# 2. Pull Git (tanpa terhalang database SQLite)
if [ -d ".git" ]; then
    echo -e "${YELLOW}Menarik kode terbaru dari Git...${NC}"
    git stash -- prisma/dev.db 2>/dev/null || true
    git pull origin main || git pull || true
fi

# 3. Sinkronisasi skema database
echo -e "${YELLOW}Sinkronisasi database Prisma...${NC}"
npx prisma db push --skip-generate

# 4. Kompilasi Build Produksi
echo -e "${YELLOW}Mengompilasi build Next.js...${NC}"
npm run build

# 5. Restart service systemd
echo -e "${YELLOW}Merestart service...${NC}"
if systemctl list-unit-files | grep -q "einvagroup.service"; then
    systemctl restart einvagroup
elif systemctl list-unit-files | grep -q "projekerja.service"; then
    systemctl restart projekerja
fi

echo -e "${GREEN}=== Pembaruan Berhasil! Aplikasi Einva Group telah aktif kembali ===${NC}"
