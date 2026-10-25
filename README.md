# KasPintar - Frontend (SPA) 🎨
> **Aplikasi Web Keuangan Kas Kelas Modern Berbasis SvelteKit & Tailwind CSS**  
> Proyek Praktikum *Pengembangan Aplikasi Berbasis Web* (PABWE) &mdash; 2026

---

## 📌 1. Gambaran Proyek

**KasPintar** adalah antarmuka pengguna (*Frontend*) berbasis **Single Page Application (SPA)** yang dibangun menggunakan SvelteKit 2 dan Svelte 5 dengan adapter statis (`@sveltejs/adapter-static`). Desain mengadopsi tema *Fintech Modern* dengan palet warna Teal/Emerald, tipografi sistem berkinerja tinggi, aksesibilitas penuh (WCAG AA), dan penanganan error terpusat.

### Fitur Antarmuka Utama:
- 📊 **Dashboard Arus Kas**: Diagram batang bulanan kas masuk vs keluar dengan Chart.js, kartu statistik saldo, dan banner pengingat iuran.
- 💸 **Pencatatan & Filter Transaksi**: Filter kategori instan tanpa klik tombol, pencarian teks dengan debounce, dan paginasi interaktif.
- 👥 **Manajemen Anggota**: CRUD data anggota dengan modal form interaktif dan toggle status cepat.
- 🗓️ **Kelola Iuran**: Generator tagihan bulanan massal dan konfirmasi pelunasan iuran.
- 🔔 **Monitoring Penunggak**: Daftar siswa/anggota menunggak dengan tombol pintas kirim pengingat via WhatsApp.
- 🔐 **Autentikasi & Guard**: Halaman masuk `/auth/login` dan pendaftaran `/auth/register` dengan tombol demo 1-klik, validasi input berlapis, serta proteksi route (*Bendahara* & *Anggota*).

---

## 🏗️ 2. Struktur Proyek & Pemisahan Tanggung Jawab (Separation of Concerns)

Aplikasi dirancang dengan arsitektur modular berlapis (*Layered Architecture*) untuk menjamin pemeliharaan kode (*maintainability*), kebersihan (*clean code*), dan keterbacaan yang tinggi:

```
src/
├── app.html                  # HTML entrypoint (meta description, viewport, title)
├── lib/
│   ├── api.js                # Core HTTP Client (Fetch wrapper, JWT Authorization, URL dinamis)
│   ├── index.js              # Re-export entrypoint modul lib
│   ├── assets/               # Aset statis & logo favicon
│   ├── components/           # Presentation Layer (Komponen UI Reusable)
│   │   ├── Badge.svelte      # Komponen pill status
│   │   ├── Button.svelte     # Komponen tombol interaktif
│   │   ├── Card.svelte       # Kontainer kartu serbaguna
│   │   ├── EmptyState.svelte # Tampilan kondisi data kosong
│   │   ├── Input.svelte      # Input field aksesibel dengan label & error
│   │   ├── Modal.svelte      # Dialog konfirmasi aksi & form
│   │   ├── PageHeader.svelte # Header judul halaman konsisten
│   │   ├── Pagination.svelte # Kontrol paginasi data
│   │   ├── Select.svelte     # Dropdown select kustom
│   │   ├── Skeleton.svelte   # Animasi loading placeholder
│   │   ├── StatCard.svelte   # Kartu metrik statistik
│   │   ├── Table.svelte      # Wrapper tabel data responsif
│   │   └── Toast.svelte      # Notifikasi feedback global
│   ├── constants/            # Application Constants & Enums
│   │   └── index.js          # Rute, role, tipe transaksi, status iuran
│   ├── services/             # Business Logic & Service Layer
│   │   ├── authService.js    # Layanan autentikasi login & registrasi
│   │   ├── categoryService.js# Layanan CRUD kategori pos kas
│   │   ├── duesService.js    # Layanan tagihan iuran & penunggak
│   │   ├── memberService.js  # Layanan manajemen data anggota
│   │   └── transactionService.js # Layanan transaksi & ringkasan saldo
│   ├── stores/               # State Management Layer (Reactive Svelte Stores)
│   │   ├── auth.js           # Pengelolaan sesi JWT & user profile
│   │   └── toast.js          # Antrean notifikasi pop-up
│   └── utils/                # Pure Helper Utilities & Sanitasi
│       ├── errorHandler.js   # Normalisasi error backend ke pesan ramah pengguna
│       ├── format.js         # Pemformatan mata uang IDR & tanggal Indonesia
│       ├── format.test.js    # Unit test utilitas format
│       ├── validators.js     # Validasi input formulir & sanitasi XSS
│       └── validators.test.js# Unit test validasi input
└── routes/                   # Routing Layer (Halaman UI SvelteKit)
    ├── +layout.js            # Konfigurasi SPA mode (ssr = false, prerender = auto)
    ├── +layout.svelte        # Shell layout utama (Sidebar, Header, Main, Footer)
    ├── +page.svelte          # Dashboard & Ringkasan Kas
    ├── layout.css            # Styling global Tailwind CSS
    ├── anggota/              # Kelola Anggota Kelas
    ├── auth/
    │   ├── login/            # Halaman Masuk Publik (/auth/login)
    │   └── register/         # Halaman Registrasi Publik (/auth/register)
    ├── iuran/                # Kelola Iuran Kas
    ├── kategori/             # Kelola Kategori Pos Kas
    ├── penunggak/            # Monitoring Penunggak Iuran
    └── transaksi/            # Riwayat & Filter Mutasi Kas
        ├── baru/             # Catat Transaksi Baru
        └── [id]/edit/        # Edit Catatan Transaksi
```

---

## 🛡️ 3. Penerapan Best Practice & Clean Code

1. **Pemisahan Logika & Tampilan (Separation of Concerns)**:
   - Komponen UI di `routes/` hanya bertugas menampilkan tampilan (*view*), menangkap aksi pengguna, dan memanggil fungsi service.
   - Seluruh logika bisnis, HTTP request, transformasi data, dan query URL diisolasi ke dalam layer `src/lib/services/`.

2. **Validasi Input & Keamanan Dasar**:
   - Validasi input dilakukan di sisi klien (*client-side*) secara berlapis pada modul `src/lib/utils/validators.js` sebelum data dikirimkan ke server.
   - Fungsi `sanitizeInput()` membersihkan tag HTML berbahaya untuk mencegah serangan *Cross-Site Scripting* (XSS).
   - Seluruh request HTTP menyertakan token JWT pada header `Authorization: Bearer <token>`.
   - Sesi pengguna otomatis dibersihkan dan dialihkan saat token kedaluwarsa (HTTP 401).

3. **Penanganan Error Terpusat (*Error Handling*)**:
   - Modul `errorHandler.js` menormalisasi kesalahan jaringan, timeout server, dan respon error JSON backend ke pesan Bahasa Indonesia yang ramah pengguna.
   - Setiap aksi gagal menampilkan notifikasi pop-up visual via komponen `Toast.svelte`.

4. **Aksesibilitas & Standar Web (WCAG 2.1 AA & Axe-Core)**:
   - Semua elemen memiliki teks yang terlihat sesuai standar *accessible name* (`label-content-name-mismatch`: 0 pelanggaran).
   - Seluruh konten berada di dalam landmark semantik (`<header>`, `<aside>`, `<main id="main-content">`, `<footer>`).
   - Rasio kontras teks memenuhi standar WCAG AA ($\ge$ 4.5:1).

---

## 🛠️ 4. Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (SPA Mode via `@sveltejs/adapter-static`)
- **Styling**: Tailwind CSS v4
- **Komponen UI**: Desain sistem mandiri (Button, Modal, StatCard, Badge, Toast, Table, EmptyState, Skeleton, Pagination, Input, Select)
- **Ikon**: `lucide-svelte`
- **Visualisasi**: Chart.js
- **Hosting / Deploy**: Vercel (`vercel.json` bawaan)

---

## 🚀 5. Panduan Menjalankan Secara Lokal

Pastikan **Bun** atau **Node.js** sudah terpasang.

1. **Install Dependensi**:
   ```bash
   bun install
   # atau: npm install
   ```

2. **Jalankan Pengujian Unit (*Unit Test*)**:
   ```bash
   bun test
   # atau: npm test
   ```

3. **Jalankan Server Development**:
   ```bash
   bun run dev
   # atau: npm run dev
   ```
   Buka peramban di `http://localhost:5173`.

4. **Build untuk Produksi**:
   ```bash
   bun run build
   # atau: npm run build
   ```
