#!/bin/bash
# ==============================================================================
# Script Instalasi Otomatis Einva Group untuk Proxmox LXC (Debian / Ubuntu)
# ==============================================================================

set -e

# Warna terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUKSES]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[PERINGATAN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${CYAN}"
echo "================================================================="
echo "        INSTALLER OTOMATIS EINVA GROUP - PROXMOX CT"
echo "================================================================="
echo -e "${NC}"

# 1. Pengecekan Hak Akses Root
if [ "$(id -u)" -ne 0 ]; then
    log_error "Script ini harus dijalankan sebagai root atau dengan sudo!"
    echo "Gunakan: sudo bash install.sh"
    exit 1
fi

CURRENT_USER=$(logname 2>/dev/null || echo "$SUDO_USER")
if [ -z "$CURRENT_USER" ]; then
    CURRENT_USER="root"
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
log_info "Direktori instalasi: ${APP_DIR}"
log_info "User pelaksana: ${CURRENT_USER}"

# 2. Pengecekan OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME=$ID
    OS_VER=$VERSION_ID
    log_info "Sistem Operasi terdeteksi: $NAME ($OS_NAME $OS_VER)"
else
    log_warn "Tidak dapat mendeteksi file /etc/os-release. Melanjutkan..."
fi

# 3. Update Package Manager & Install Prerequisite
log_info "Memperbarui daftar paket sistem (apt update)..."
apt-get update -y

log_info "Menginstal paket dasar (curl, wget, git, build-essential, openssl, sqlite3)..."
apt-get install -y curl wget git build-essential openssl sqlite3 ca-certificates gnupg

# 4. Pengecekan & Instalasi Node.js (v20 LTS disarankan)
NEED_NODE_INSTALL=0
if command -v node >/dev/null 2>&1; then
    NODE_CURRENT_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT_VER" -lt 20 ]; then
        log_warn "Node.js versi saat ini ($NODE_CURRENT_VER) di bawah v20. Akan diperbarui ke Node.js 20 LTS..."
        NEED_NODE_INSTALL=1
    else
        log_success "Node.js sudah terpasang: $(node -v)"
    fi
else
    NEED_NODE_INSTALL=1
fi

if [ "$NEED_NODE_INSTALL" -eq 1 ]; then
    log_info "Memasang Node.js 20 LTS dari NodeSource repository..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
    apt-get update -y
    apt-get install -y nodejs
    log_success "Node.js berhasil dipasang: $(node -v) & npm $(npm -v)"
fi

NODE_BIN=$(which node)
NPM_BIN=$(which npm)

# 5. Konfigurasi IP & Variabel Lingkungan (.env)
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

cd "$APP_DIR"

log_info "Menyiapkan file konfigurasi environment (.env)..."
if [ ! -f .env ]; then
    log_info "File .env belum ditemukan. Membuat .env baru..."
    RANDOM_SECRET=$(openssl rand -base64 32)
    cat <<EOF > .env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="${RANDOM_SECRET}"
NEXTAUTH_URL="http://${SERVER_IP}:3000"
EOF
    log_success "File .env berhasil dibuat dengan NEXTAUTH_URL=http://${SERVER_IP}:3000"
else
    log_info "File .env sudah ada. Memeriksa konfigurasi..."
    if ! grep -q "DATABASE_URL" .env; then
        echo 'DATABASE_URL="file:./dev.db"' >> .env
    fi
    if ! grep -q "NEXTAUTH_SECRET" .env; then
        RANDOM_SECRET=$(openssl rand -base64 32)
        echo "NEXTAUTH_SECRET=\"${RANDOM_SECRET}\"" >> .env
    fi
    if ! grep -q "NEXTAUTH_URL" .env; then
        echo "NEXTAUTH_URL=\"http://${SERVER_IP}:3000\"" >> .env
    fi
fi

# 6. Install Dependencies (npm install)
log_info "Menginstal dependensi proyek (npm install)..."
npm install

# 7. Setup Prisma Database
log_info "Menghasilkan Prisma Client (prisma generate)..."
npx prisma generate

log_info "Sinkronisasi skema database ke SQLite (prisma db push)..."
npx prisma db push --skip-generate

# Pastikan folder prisma dan database dimiliki oleh user eksekusi
chown -R "$CURRENT_USER":"$CURRENT_USER" "$APP_DIR/prisma"

# Cek apakah perlu seed data contoh jika DB masih kosong
HAS_USERS=0
if [ -f "$APP_DIR/prisma/dev.db" ]; then
    USER_COUNT=$(sqlite3 "$APP_DIR/prisma/dev.db" "SELECT count(*) FROM User;" 2>/dev/null || echo "0")
    if [ "$USER_COUNT" -gt 0 ]; then
        HAS_USERS=1
        log_info "Database telah memiliki $USER_COUNT user terdaftar."
    fi
fi

if [ "$HAS_USERS" -eq 0 ]; then
    log_info "Database masih baru/kosong. Melakukan seeding data awal (admin & contoh)..."
    npx prisma db seed || log_warn "Seeding dilewati atau gagal. Anda dapat membuat akun admin via register."
fi

# 8. Build Aplikasi Next.js untuk Produksi
log_info "Membuat build produksi Next.js (npm run build)..."
npm run build

# Pastikan kepemilikan file kembali ke CURRENT_USER
chown -R "$CURRENT_USER":"$CURRENT_USER" "$APP_DIR"

# 9. Setup Systemd Service (einvagroup.service)
log_info "Membuat service systemd (einvagroup.service)..."
SERVICE_FILE="/etc/systemd/system/einvagroup.service"

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Einva Group Next.js Application
After=network.target

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
ExecStart=${NPM_BIN} run start
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Buat alias/symlink projekerja.service agar perintah lama tetap valid
ln -sf /etc/systemd/system/einvagroup.service /etc/systemd/system/projekerja.service 2>/dev/null || true

log_info "Memuat ulang daemon systemd..."
systemctl daemon-reload
systemctl enable einvagroup
systemctl restart einvagroup

# 10. Pengaturan Firewall (jika UFW aktif)
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(ufw status | grep "Status: active" || true)
    if [ -n "$UFW_STATUS" ]; then
        log_info "UFW firewall terdeteksi aktif. Membuka port 3000/tcp..."
        ufw allow 3000/tcp comment 'Einva Group Next.js'
    fi
fi

# 11. Verifikasi Service Berjalan
log_info "Memeriksa status service (menunggu 3 detik)..."
sleep 3

if systemctl is-active --quiet einvagroup; then
    log_success "Service einvagroup berjalan dengan baik (Active: running)!"
else
    log_warn "Service belum berjalan secara normal. Memeriksa log..."
    journalctl -u einvagroup -n 20 --no-pager
fi

echo -e "${GREEN}"
echo "================================================================="
echo "          INSTALASI EINVA GROUP BERHASIL SELESAI!                "
echo "================================================================="
echo -e "${NC}"
echo -e "Aplikasi sekarang berjalan otomatis di background."
echo -e "Akses aplikasi melalui browser:"
echo -e "${CYAN}  1. Web Portal & Portofolio : http://${SERVER_IP}:3000 ${NC}"
echo -e "${CYAN}  2. Login Portal Karyawan   : http://${SERVER_IP}:3000/login ${NC}"
echo ""
echo -e "${YELLOW}Informasi Akun Login Portal Karyawan:${NC}"
echo "  - Email Admin   : admin@einvaintidata.com (atau admin@einvagroup.com)"
echo "  - Password      : admin123"
echo "  - Email Manager : siti@einvagroup.com (Password: manager123)"
echo "  - Email Staff   : budi@einvagroup.com (Password: staff123)"
echo ""
echo -e "${YELLOW}Perintah Berguna untuk Pengelolaan:${NC}"
echo "  - Cek status server    : systemctl status einvagroup"
echo "  - Restart server       : systemctl restart einvagroup"
echo "  - Hentikan server      : systemctl stop einvagroup"
echo "  - Lihat log realtime   : journalctl -u einvagroup -f"
echo "  - Update aplikasi      : ./update.sh"
echo "================================================================="
