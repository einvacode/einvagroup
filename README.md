# Einva Group - Web Portal Portofolio & Sistem Operasional Internal

Platform terpadu berbasis Next.js App Router, Prisma ORM, dan SQLite yang menggabungkan:
1. **Web Portal Publik & Portofolio Resmi Perusahaan:** Menampilkan profil badan usaha **Einva Group**, layanan spesialis (CCTV Surveillance, Fiber Optic & Jaringan, Access Control, Kelistrikan), portofolio proyek karya yang diselesaikan, dan kontak kantor/WhatsApp untuk calon klien.
2. **Portal Karyawan Internal (Terproteksi):** Dashboard khusus staf dan manajemen untuk mengelola proyek kerja, surat penawaran harga (SPH/Quotation), invoice & penagihan, penjadwalan teknisi lapangan, dan laporan keuangan internal.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Menjalankan di Komputer Lokal (Windows)
Untuk menjalankan di komputer Windows lokal secara cepat:
- Klik dua kali file **[`start.bat`](file:///C:/Users/Admin/Documents/claude/projekerja/start.bat)**.
- Script akan memeriksa dependensi, menyinkronkan database, menjalankan server pengembang, dan membuka browser otomatis ke `http://localhost:3000`.

Atau via terminal / PowerShell:
```bash
npm install
npx prisma db push
npm run dev
```

---

### 2. Instalasi di Proxmox LXC Container (CT)
Untuk memasang aplikasi ini di Linux Container (CT) Proxmox VE (Debian / Ubuntu):
1. Pindahkan folder proyek ke dalam container (misalnya di `/var/www/einvagroup`).
2. Masuk ke folder proyek dan jalankan installer otomatis:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
3. Akses aplikasi melalui browser:
   - **Web Portal Publik & Portofolio:** `http://<IP-CONTAINER>:3000`
   - **Portal Karyawan (Login Internal):** `http://<IP-CONTAINER>:3000/login`

📖 **Panduan lengkap langkah demi langkah dari pembuatan CT hingga konfigurasi Nginx & SSL dapat dibaca di:**
👉 **[`DEPLOY_PROXMOX.md`](file:///C:/Users/Admin/Documents/claude/projekerja/DEPLOY_PROXMOX.md)**

---

## 🛠️ Stack Teknologi
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Autentikasi:** NextAuth.js
- **Service Manager Linux:** Systemd (`einvagroup.service`)

---

## 🔑 Akun Login (Portal Karyawan)
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@einvaintidata.com` *(atau `admin@einvagroup.com`)* | `admin123` |
| **Manager** | `siti@einvagroup.com` *(atau `siti@projekerja.com`)* | `manager123` |
| **Staff** | `budi@einvagroup.com` *(atau `budi@projekerja.com`)* | `staff123` |

*(Jika database lokal Anda sudah memiliki data akun, gunakan akun yang sudah tersimpan tersebut).*

---

## 📁 Struktur File Penting
- **[`install.sh`](file:///C:/Users/Admin/Documents/claude/projekerja/install.sh)**: Script instalasi otomatis untuk Linux/Proxmox CT (Node.js 20 LTS, Prisma, Systemd `einvagroup.service`).
- **[`update.sh`](file:///C:/Users/Admin/Documents/claude/projekerja/update.sh)**: Script pembaruan aplikasi dan restart service otomatis.
- **[`DEPLOY_PROXMOX.md`](file:///C:/Users/Admin/Documents/claude/projekerja/DEPLOY_PROXMOX.md)**: Panduan lengkap setup Proxmox CT.
- **[`start.bat`](file:///C:/Users/Admin/Documents/claude/projekerja/start.bat)**: Launcher cepat untuk Windows.
- **[`prisma/schema.prisma`](file:///C:/Users/Admin/Documents/claude/projekerja/prisma/schema.prisma)**: Skema database Prisma.
- **[`prisma/dev.db`](file:///C:/Users/Admin/Documents/claude/projekerja/prisma/dev.db)**: File database SQLite lokal.
