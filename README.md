# KasPintar 💰
> **Sistem Pencatatan Uang Kas Kelas Modern, Transparan, dan Otomatis**  
> Proyek Praktikum *Pengembangan Aplikasi Berbasis Web* (PABWE) &mdash; 2026

---

## 📌 1. Gambaran Proyek

**KasPintar** adalah aplikasi web pencatatan keuangan kas kelas yang dirancang untuk mengatasi permasalahan manualisasi pembukuan uang kas mahasiswa. Aplikasi ini mempermudah pencatatan mutasi kas (pemasukan & pengeluaran), pengelolaan data anggota kelas, pelacakan tagihan iuran bulanan, serta pengingat pembayaran iuran personal secara otomatis.

### Fitur Utama:
- 📊 **Dashboard Arus Kas Real-Time**: Visualisasi saldo kas aktif, komparasi bulanan kas masuk vs. kas keluar dengan Chart.js, serta daftar 5 mutasi kas terakhir.
- 💸 **Pencatatan Transaksi Kas Cerdas**: Pencatatan pemasukan dan pengeluaran kas dengan klasifikasi kategori, penautan anggota, pencarian teks instan, dan filter kategori tanpa perlu menekan tombol saring.
- ⚡ **Otomatisasi Tagihan Iuran Bulanan**: Generator pembuatan tagihan iuran massal untuk seluruh anggota aktif dalam satu kali klik tanpa duplikasi periode.
- 🔔 **Pengingat & Pelacakan Penunggak**: Sistem otomatis menghitung status tagihan (Lunas, Belum Bayar, atau Terlambat berdasarkan tanggal jatuh tempo) serta tautan langsung pengingat ramah via WhatsApp.
- 🔐 **Autentikasi & Hak Akses Berbasis Peran**: Perbedaan antarmuka dan hak akses yang tegas antara **Bendahara** (akses penuh kelola kas, anggota, dan iuran) dan **Anggota** (hanya memantau transparansi kas dan iuran miliknya).
- 🎨 **UI Modern Ala Fintech**: Mengusung desain *clean & modern* (Linear/Mercury) dengan warna utama Teal/Emerald, tipografi *Plus Jakarta Sans* luring (offline), dan komponen dialog modal modern (tanpa `alert` / `confirm` bawaan browser).

---

## 🛠️ 2. Tech Stack

Proyek ini dibangun menggunakan arsitektur monorepo dengan teknologi mutakhir:

| Layer | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Runtime & Package Manager** | **Bun** (Minimal **v1.1.0+**, teruji pada **v1.4.3**) | Menggantikan Node.js dan npm. Semua eksekusi script dan manajemen dependensi murni menggunakan Bun. |
| **Backend API** | **Express.js** berjalan di Bun | REST API mandiri yang menyediakan data internal. |
| **Database** | **SQLite via `bun:sqlite`** | Driver SQLite bawaan Bun berkecepatan tinggi dengan *prepared statements* dan transaksi atomik (`db.transaction`). |
| **Autentikasi & Enkripsi** | **JSON Web Token (`jsonwebtoken`) & `bcryptjs`** | Autentikasi Stateless dengan masa berlaku 1 hari. Menggunakan `bcryptjs` murni tanpa native addon C++ agar stabil di Jenkins dan hosting. |
| **Frontend** | **SvelteKit** (Mode SPA via `@sveltejs/adapter-static`) | Single Page Application murni (`ssr = false`, `prerender = false`) yang hanya berkomunikasi via API Express. |
| **Styling & Desain** | **Tailwind CSS v4** | Palet warna tema Emerald/Teal (`#0F766E`), radius lembut, dan hierarki visual jelas. |
| **Ikon Antarmuka** | **`lucide-svelte`** | Paket ikon SVG vektor modern, menggantikan penggunaan emoji mentah. |
| **Tipografi** | **`@fontsource-variable/plus-jakarta-sans`** | Font mandiri (self-hosted offline), tidak bergantung pada CDN Google Fonts agar aman di build Jenkins. |
| **Grafik Keuangan** | **Chart.js** | Visualisasi diagram batang (*bar chart*) arus kas bulanan. |
| **CI / CD** | **Jenkins Declarative Pipeline (`Jenkinsfile`)** | Pipeline otomatis: verifikasi dependensi, *backend unit test*, dan *frontend build*. |

---

## 📂 3. Struktur Direktori Proyek

```
ifs24034-pabwe2026-proyek1/
├── backend/                        # Server REST API Express.js
│   ├── routes/                     # Modul endpoint REST API
│   │   ├── auth.js                 # Endpoint login & profil
│   │   ├── categories.js           # Endpoint CRUD pos kategori
│   │   ├── dues.js                 # Endpoint tagihan & pelunasan iuran
│   │   ├── members.js              # Endpoint CRUD anggota kelas
│   │   ├── reminders.js            # Endpoint status pengingat & penunggak
│   │   ├── summary.js              # Endpoint kalkulasi saldo & ringkasan
│   │   └── transactions.js         # Endpoint mutasi kas & filter instan
│   ├── middleware/                 # Middleware Express
│   │   └── auth.js                 # requireAuth & requireRole('bendahara')
│   ├── test/                       # Unit & integration test (bun test)
│   │   ├── auth_reminders.test.js
│   │   ├── backend_basic.test.js
│   │   └── db_schema.test.js
│   ├── db.js                       # Koneksi bun:sqlite & skema tabel DDL
│   ├── seed.js                     # Seeder idempoten data awal & akun demo
│   ├── server.js                   # Entry point backend server (port 5001)
│   ├── bun.lock                    # Lockfile resmi Bun
│   ├── package.json
│   └── .env.example
├── frontend/                       # Client SPA SvelteKit
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/         # Komponen UI: Button, Modal, Badge, Toast, dll.
│   │   │   ├── stores/             # Svelte Stores: auth.js, toast.js
│   │   │   ├── utils/              # Helper format rupiah, tanggal, periode
│   │   │   └── api.js              # Centralized HTTP Client (JWT Authorization)
│   │   └── routes/                 # Halaman aplikasi
│   │       ├── +layout.svelte      # Sidebar fintech desktop & mobile drawer
│   │       ├── +page.svelte        # Dashboard ringkasan kas
│   │       ├── login/+page.svelte  # Halaman login 2-kolom modern
│   │       ├── transaksi/          # Daftar transaksi kas & form
│   │       ├── iuran/              # Kelola & riwayat iuran
│   │       ├── anggota/            # Manajemen anggota kelas
│   │       ├── penunggak/          # Rekap penunggak & aksi WhatsApp
│   │       └── kategori/           # Manajemen pos kategori kas
│   ├── static/                     # Aset statis & favicon
│   ├── bun.lock                    # Lockfile resmi Bun
│   ├── svelte.config.js / vite.config.js
│   └── package.json
├── Jenkinsfile                     # Pipeline CI/CD Declarative Jenkins
├── .gitignore
└── README.md                       # Dokumentasi lengkap proyek
```

---

## 🗄️ 4. Skema Database SQLite

Database dikelola melalui `bun:sqlite` dengan penegakan integritas data (*Foreign Key & Check Constraints*):

```sql
PRAGMA foreign_keys = ON;
```

### Tabel-Tabel Utama:
1. **`categories`**
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `nama` (TEXT UNIQUE NOT NULL)
   - `jenis` (TEXT CHECK(jenis IN ('masuk', 'keluar')) NOT NULL)
2. **`members`**
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `nama` (TEXT NOT NULL)
   - `kontak` (TEXT)
   - `aktif` (INTEGER CHECK(aktif IN (0, 1)) DEFAULT 1 NOT NULL)
   - `created_at` (TEXT DEFAULT CURRENT_TIMESTAMP)
3. **`users`**
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `username` (TEXT UNIQUE NOT NULL)
   - `password_hash` (TEXT NOT NULL)
   - `role` (TEXT CHECK(role IN ('bendahara', 'anggota')) NOT NULL)
   - `member_id` (INTEGER REFERENCES members(id) ON DELETE SET NULL)
   - `created_at` (TEXT DEFAULT CURRENT_TIMESTAMP)
4. **`transactions`**
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `tanggal` (TEXT NOT NULL) &mdash; Format `YYYY-MM-DD`
   - `jenis` (TEXT CHECK(jenis IN ('masuk', 'keluar')) NOT NULL)
   - `jumlah` (INTEGER CHECK(jumlah > 0) NOT NULL) &mdash; Rupiah utuh
   - `category_id` (INTEGER REFERENCES categories(id) ON DELETE RESTRICT NOT NULL)
   - `member_id` (INTEGER REFERENCES members(id) ON DELETE SET NULL)
   - `keterangan` (TEXT)
   - `created_by` (INTEGER REFERENCES users(id) ON DELETE RESTRICT NOT NULL)
   - `created_at` (TEXT DEFAULT CURRENT_TIMESTAMP)
5. **`dues`**
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `member_id` (INTEGER REFERENCES members(id) ON DELETE CASCADE NOT NULL)
   - `periode` (TEXT NOT NULL) &mdash; Format `YYYY-MM`
   - `nominal` (INTEGER CHECK(nominal > 0) NOT NULL)
   - `jatuh_tempo` (TEXT NOT NULL) &mdash; Format `YYYY-MM-DD`
   - `status` (TEXT CHECK(status IN ('belum', 'lunas')) DEFAULT 'belum' NOT NULL)
   - `tanggal_bayar` (TEXT)
   - `UNIQUE(member_id, periode)`

> **Aturan Bisnis Penting:**
> - Saldo kas **tidak disimpan** dalam kolom, melainkan selalu dihitung dinamis dari `SUM(masuk) - SUM(keluar)` di backend.
> - Status "terlambat" dihitung dinamis saat query: `status = 'belum' AND jatuh_tempo < date('now')`.
> - Pelunasan iuran dijalankan dalam transaksi atomik (`db.transaction`), di mana update status iuran dan pencatatan mutasi kas masuk terjadi secara bersamaan.

---

## 👤 5. Akun Demo Siap Pakai

Sistem telah dilengkapi seeder data awal idempoten (`seed.js`) dengan 4 akun demo:

| Username | Password | Peran (Role) | Keterangan & Status Kas |
| :--- | :--- | :--- | :--- |
| **`bendahara`** | `bendahara123` | **Bendahara** | Akses penuh seluruh fitur: kelola kas, buat tagihan, konfirmasi lunas, anggota, penunggak, & kategori. |
| **`anggota1`** | `anggota123` | **Anggota** (Ahmad Fauzi) | Memiliki tagihan aktif periode berjalan (belum jatuh tempo). |
| **`anggota2`** | `anggota123` | **Anggota** (Budi Santoso) | Memiliki tunggakan iuran yang telah melewati tanggal jatuh tempo (terlambat). |
| **`anggota3`** | `anggota123` | **Anggota** (Citra Dewi) | Seluruh tagihan iuran sudah lunas (status tertib). |

> **Tips:** Pada halaman login KasPintar, tersedia tombol **1-Klik Akun Demo** yang akan langsung mengisi *username* dan *password* secara otomatis.

---

## 🚀 6. Panduan Instalasi & Menjalankan Aplikasi

Pastikan **Bun** sudah terpasang pada komputer Anda.  
Periksa dengan menjalankan perintah:
```bash
bun --version
```
*(Versi minimal: Bun v1.1.0 atau lebih tinggi)*.

### Langkah 1: Kloning Repositori
```bash
git clone https://github.com/Tomannn-star/ifs24034-pabwe2026-proyek1.git
cd ifs24034-pabwe2026-proyek1
```

### Langkah 2: Setup Backend
1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Pasang dependensi menggunakan Bun:
   ```bash
   bun install
   ```
3. Konfigurasi berkas `.env`:
   Buat file `.env` di dalam folder `backend/` (atau salin dari `.env.example`):
   ```env
   PORT=5001
   JWT_SECRET=kaspintar_super_secret_jwt_key_2026
   DB_PATH=kaspintar.db
   ```
4. Jalankan Seeder Database:
   ```bash
   bun seed.js
   ```
   *(Aman dijalankan berulang kali tanpa membuat duplikasi data).*
5. Jalankan Backend Server:
   - **Mode Development (Auto-Reload)**:
     ```bash
     bun dev
     ```
   - **Mode Standar**:
     ```bash
     bun start
     ```
   Server backend akan aktif di `http://localhost:5001`.

### Langkah 3: Setup Frontend
1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Pasang dependensi menggunakan Bun:
   ```bash
   bun install
   ```
3. Jalankan Frontend Development Server:
   ```bash
   bun run dev
   ```
4. Buka peramban (browser) dan akses:
   ```
   http://localhost:5173
   ```

---

## 🧪 7. Menjalankan Pengujian Otomatis (*Unit Test*)

Backend KasPintar telah dilengkapi rangkaian tes otomatis menyeluruh yang menguji integritas skema database, autentikasi JWT, hak akses role, serta logika bisnis keuangan:

```bash
cd backend
bun test
```

### Hasil Pengujian (33/33 Lolos):
- `test/db_schema.test.js`: Validasi foreign key, check constraint, unique constraint, dan idempotensi seed.
- `test/auth_reminders.test.js`: Pengujian login JWT, proteksi route, payload profil, dan kalkulasi tagihan terlambat.
- `test/backend_basic.test.js`: Pengujian operasi CRUD transaksi kas, perhitungan saldo atomik, proteksi role bendahara, serta pelunasan iuran otomatis.

---

## 📦 8. Membangun Build Produksi Frontend (*Static SPA*)

Frontend KasPintar dikonfigurasi menggunakan mode Single Page Application (SPA) dengan `@sveltejs/adapter-static`:

```bash
cd frontend
bun run build
```
Hasil build statis akan tersimpan di dalam folder `frontend/build/` dengan entry point utama `frontend/build/index.html`. Berkas ini siap dideploy ke server web statis seperti Nginx, Cloudflare Pages, atau disajikan langsung melalui reverse proxy.

---

## 📡 9. Dokumentasi REST API Endpoint

Semua endpoint API diawali dengan prefiks `/api` dan menggunakan header `Authorization: Bearer <token_jwt>`.

### 🔑 Autentikasi (`/api/auth`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Publik | Login dengan `username` dan `password`. Mengembalikan token JWT dan profil. |
| `GET` | `/api/auth/me` | Autentikasi | Mendapatkan data profil pengguna yang sedang login. |

### 🏷️ Kategori Transaksi (`/api/categories`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Autentikasi | Mengambil seluruh daftar pos kategori pemasukan & pengeluaran. |
| `POST` | `/api/categories` | Bendahara | Membuat kategori baru (`nama`, `jenis`). |
| `PUT` | `/api/categories/:id` | Bendahara | Mengedit nama atau jenis kategori. |
| `DELETE` | `/api/categories/:id` | Bendahara | Menghapus kategori (ditolak jika kategori sudah dipakai bertransaksi). |

### 👥 Anggota Kelas (`/api/members`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | Bendahara | Mengambil daftar anggota (bisa difilter `?aktif=1` atau `?q=nama`). |
| `POST` | `/api/members` | Bendahara | Mendaftarkan anggota kelas baru. |
| `PUT` | `/api/members/:id` | Bendahara | Memperbarui data anggota atau status keaktifan (`aktif: 0/1`). |
| `DELETE` | `/api/members/:id` | Bendahara | Menghapus anggota beserta relasi tagihannya. |

### 💵 Transaksi Kas (`/api/transactions`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | Autentikasi | Mengambil daftar transaksi dengan pagination (`page`, `limit`, `jenis`, `category_id`, `dari`, `sampai`, `q`). |
| `GET` | `/api/transactions/:id` | Autentikasi | Mengambil rincian 1 transaksi. |
| `POST` | `/api/transactions` | Bendahara | Mencatat mutasi kas masuk atau keluar baru. |
| `PUT` | `/api/transactions/:id` | Bendahara | Mengubah data catatan transaksi. |
| `DELETE` | `/api/transactions/:id` | Bendahara | Menghapus catatan transaksi. |

### 📊 Ringkasan Kas (`/api/summary`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/summary` | Autentikasi | Mengembalikan total saldo, total pemasukan, total pengeluaran, rekap arus kas per bulan, dan total penunggak. |

### 🗓️ Iuran Bulanan (`/api/dues`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dues` | Autentikasi | Mengambil daftar tagihan iuran (Anggota hanya melihat iuran miliknya; Bendahara melihat seluruh anggota). |
| `POST` | `/api/dues/generate` | Bendahara | Membuat tagihan massal untuk anggota aktif pada periode tertentu. |
| `POST` | `/api/dues/:id/pay` | Bendahara | Menandai iuran lunas dan otomatis mencatat transaksi pemasukan kas. |

### ⏰ Pengingat & Penunggak (`/api/reminders`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reminders` | Anggota | Menampilkan status tagihan personal anggota (jumlah belum bayar, total tunggakan, status terlambat). |
| `GET` | `/api/reminders/overdue` | Bendahara | Menampilkan daftar seluruh anggota yang menunggak beserta rincian bulan dan total keterlambatannya. |

---

## ⚙️ 10. Konfigurasi CI/CD Jenkins (`Jenkinsfile`)

Repositori ini menyertakan berkas `Jenkinsfile` dengan sintaks **Declarative Pipeline** resmi. Pipeline ini mengotomatisasi siklus integrasi berkelanjutan setiap ada perubahan kode (*commit/push*):

```groovy
pipeline {
    agent any
    stages {
        stage('Verifikasi Environment')  // Memastikan runtime Bun terpasang
        stage('Install Dependencies')    // bun install pada backend & frontend
        stage('Test Backend API')        // Menjalankan bun test (33 tests)
        stage('Build Frontend SPA')      // Menjalankan bun run build
        stage('Verifikasi Hasil Build')  // Memastikan index.html terbentuk
        stage('Arsip Artefak')           // Mengarsipkan direktori build/
    }
}
```

---

## 👨‍💻 Pengembang
- **Nama Pengembang**: Toman Sihombing
- **NIM**: 11S24034 / ifs24034
- **Mata Kuliah**: Praktikum Pengembangan Aplikasi Berbasis Web (PABWE)
- **Tahun**: 2026
- **Repository**: [GitHub ifs24034-pabwe2026-proyek1](https://github.com/Tomannn-star/ifs24034-pabwe2026-proyek1)
- **Lisensi**: Proyek Tugas Akademik &mdash; Bebas digunakan untuk keperluan pembelajaran.
