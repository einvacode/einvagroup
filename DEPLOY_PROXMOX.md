# Panduan Instalasi Einva Group di Proxmox LXC Container (CT)

Dokumen ini berisi panduan lengkap langkah demi langkah untuk menginstal dan menjalankan aplikasi **Einva Group** di dalam Proxmox VE menggunakan Linux Container (LXC / CT) berbasis **Debian 12** atau **Ubuntu 22.04 / 24.04**.

---

## 📋 1. Persyaratan Sistem & Rekomendasi CT

| Komponen | Spesifikasi Minimum | Rekomendasi |
| :--- | :--- | :--- |
| **OS Template** | Debian 12 (Bookworm) / Ubuntu 22.04 | Debian 12 Standard |
| **CPU Cores** | 1 Core | 2 Cores (mempercepat build Next.js) |
| **RAM** | 1 GB (1024 MB) | 2 GB (2048 MB) + 512 MB Swap |
| **Disk Storage** | 8 GB | 15 - 20 GB (SSD / NVMe) |
| **Jaringan** | Bridge `vmbr0` (DHCP atau Static IP) | Static IP lokal (contoh: `192.168.1.50`) |

---

## 🛠️ 2. Langkah Membuat Container (CT) di Proxmox VE

1. Buka antarmuka web Proxmox VE Anda (`https://ip-proxmox:8006`).
2. Unduh template container jika belum ada:
   - Pilih storage template (biasanya `local`).
   - Masuk ke tab **CT Templates** -> Klik **Templates**.
   - Pilih **debian-12-standard** atau **ubuntu-22.04-standard**, lalu klik **Download**.
3. Klik tombol **Create CT** di pojok kanan atas:
   - **General:**
     - CT ID: misalnya `105`
     - Hostname: `einvagroup`
     - Password: Isi password root untuk login ke CT
     - Uncheck *Unprivileged container* jika ingin performa native, atau biarkan default.
   - **Template:** Pilih template Debian 12 / Ubuntu yang telah diunduh.
   - **Disks:** Ukuran `15` GB.
   - **CPU:** `2` Cores.
   - **Memory:** Memory `2048` MB, Swap `512` MB.
   - **Network:**
     - Bridge: `vmbr0`
     - IPv4: Isi IP Static, contoh: `192.168.1.50/24` dengan Gateway: `192.168.1.1` (atau pilih DHCP).
   - **DNS:** Biarkan default host atau isi `8.8.8.8`.
   - **Confirm:** Klik **Finish**, lalu jalankan CT dengan klik **Start**.

---

## 📂 3. Memindahkan File Project ke dalam Container

Pilih salah satu cara yang paling mudah bagi Anda:

### Cara A: Menggunakan WinSCP / FileZilla (Paling Mudah)
1. Buka aplikasi **WinSCP** atau **FileZilla** di komputer Windows Anda.
2. Hubungkan ke IP Container Proxmox:
   - Protocol: **SFTP** atau **SCP**
   - Host: `<IP-CONTAINER>` (contoh: `192.168.1.50`)
   - Port: `22`
   - User: `root`
   - Password: Password root container Anda
3. Salin/Upload folder `projekerja` ke direktori `/var/www/einvagroup` (atau ke `/root/einvagroup`).
> **Tips:** Anda tidak perlu mengikutsertakan folder `node_modules` dan `.next` saat upload untuk menghemat waktu dan kuota.

### Cara B: Dari Console / Terminal Komputer (SCP Command)
Buka PowerShell di folder project pada komputer Windows Anda, lalu jalankan:
```bash
scp -r . root@192.168.1.50:/var/www/einvagroup
```

---

## 🚀 4. Menjalankan Skrip Instalasi Otomatis

1. Buka **Console** container di Proxmox VE (atau via SSH).
2. Masuk ke direktori folder project:
   ```bash
   cd /var/www/einvagroup
   ```
   *(atau sesuaikan dengan direktori tempat Anda menaruh folder aplikasi).*

3. Berikan izin eksekusi pada script `install.sh`:
   ```bash
   chmod +x install.sh update.sh
   ```

4. Jalankan script instalasi:
   ```bash
   ./install.sh
   ```

### Apa Saja yang Dikerjakan oleh `install.sh` Secara Otomatis?
- Memeriksa hak akses root dan sistem operasi.
- Memasang paket prasyarat (`curl`, `git`, `build-essential`, `openssl`, `sqlite3`).
- Memasang **Node.js 20 LTS** & `npm` resmi dari NodeSource.
- Mendeteksi IP container dan membuat/menyesuaikan file konfigurasi `.env`.
- Menginstal dependensi proyek (`npm install`).
- Melakukan sinkronisasi skema database SQLite via Prisma (`prisma db push`).
- Melakukan kompilasi build produksi Next.js (`npm run build`).
- Membuat dan mengaktifkan **Systemd Service** (`einvagroup.service`) agar aplikasi:
  - Berjalan otomatis di latar belakang (background).
  - Otomatis menyala saat Container di-boot/restart.
  - Otomatis pulih jika terjadi crash.
- Membuka port `3000` di firewall UFW jika firewall aktif.

---

## 🌐 5. Mengakses Aplikasi

Setelah instalasi selesai, aplikasi menyediakan dua pintu akses:

1. **Web Portal Publik & Portofolio Perusahaan:**
   ```text
   http://<IP-CONTAINER>:3000
   Contoh: http://192.168.1.50:3000
   ```
   *Halaman ini bersifat publik untuk menampilkan profil resmi Einva Group, layanan spesialis (CCTV, Fiber Optic, Access Control, Kelistrikan), portofolio proyek yang diselesaikan, dan kontak kantor/WhatsApp untuk calon klien.*

2. **Portal Karyawan & Manajemen Internal (Terproteksi):**
   ```text
   http://<IP-CONTAINER>:3000/login
   ```
   *Pintu masuk khusus staf dan manajemen operasional untuk mengelola proyek kerja, surat penawaran harga (SPH), invoice & penagihan, kalender teknisi, serta laporan keuangan.*

### Akun Login Bawaan (Default):
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@einvaintidata.com` *(atau `admin@einvagroup.com`)* | `admin123` |
| **Manager** | `siti@einvagroup.com` *(atau `siti@projekerja.com`)* | `manager123` |
| **Staff** | `budi@einvagroup.com` *(atau `budi@projekerja.com`)* | `staff123` |

*(Jika database lokal Anda sudah memiliki data akun, gunakan akun yang sudah tersimpan tersebut).*

---

## ⚙️ 6. Perintah Pengelolaan Aplikasi (Systemd)

Aplikasi dikelola menggunakan systemd service dengan nama `einvagroup`:

- **Melihat status server:**
  ```bash
  systemctl status einvagroup
  ```
- **Me-restart server:**
  ```bash
  systemctl restart einvagroup
  ```
- **Menghentikan server:**
  ```bash
  systemctl stop einvagroup
  ```
- **Menjalankan kembali server:**
  ```bash
  systemctl start einvagroup
  ```
- **Melihat log aplikasi secara realtime:**
  ```bash
  journalctl -u einvagroup -f
  ```

---

## 🔄 7. Cara Memperbarui Aplikasi (Update)

Jika Anda memiliki perubahan kode atau ingin memperbarui aplikasi di kemudian hari:
1. Masuk ke folder aplikasi di container:
   ```bash
   cd /var/www/einvagroup
   ```
2. Jalankan skrip pembaruan otomatis:
   ```bash
   ./update.sh
   ```
Skrip ini akan otomatis mem-backup database, menginstal dependensi baru, memperbarui skema Prisma, mengompilasi ulang Next.js, dan me-restart service.

---

## 🔒 8. Konfigurasi Opsional: Nginx Reverse Proxy & SSL (Port 80/443)

Jika Anda ingin mengakses aplikasi tanpa menyertakan `:3000` (menggunakan port `80` standar atau domain dengan SSL gratis):

1. Install Nginx:
   ```bash
   apt install -y nginx
   ```
2. Buat file konfigurasi Nginx:
   ```bash
   nano /etc/nginx/sites-available/einvagroup
   ```
3. Masukkan konfigurasi berikut:
   ```nginx
   server {
       listen 80;
       server_name einvagroup.local 192.168.1.50; # Ganti dengan domain/IP Anda

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. Aktifkan konfigurasi dan restart Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/einvagroup /etc/nginx/sites-enabled/
   rm -f /etc/nginx/sites-enabled/default
   nginx -t
   systemctl restart nginx
   ```
5. *(Opsional)* Jika menggunakan domain publik dan ingin SSL Let's Encrypt gratis:
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d domainanda.com
   ```

---

## 💾 9. Backup & Restore Database

Database aplikasi berbasis SQLite yang tersimpan di satu file:
- **Lokasi file database:** `/var/www/einvagroup/prisma/dev.db`

### Membuat Backup Manual:
```bash
cp /var/www/einvagroup/prisma/dev.db /root/dev_db_backup_$(date +%Y%m%d).db
```

### Mengembalikan Data (Restore):
```bash
systemctl stop einvagroup
cp /path/backup/dev.db /var/www/einvagroup/prisma/dev.db
systemctl start einvagroup
```
