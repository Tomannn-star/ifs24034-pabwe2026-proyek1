# KasPintar - Frontend (SPA) 🎨
> **Aplikasi Web Keuangan Kas Kelas Modern Berbasis SvelteKit & Tailwind CSS**  
> Proyek Praktikum *Pengembangan Aplikasi Berbasis Web* (PABWE) &mdash; 2026

---

## 📌 1. Gambaran Frontend

Repositori ini berisi antarmuka pengguna (*Frontend*) **KasPintar** yang dibangun sebagai **Single Page Application (SPA)** menggunakan SvelteKit dengan adapter statis (`@sveltejs/adapter-static`). Desain mengadopsi tema *Fintech Modern* dengan palet warna Teal/Emerald, tipografi *Plus Jakarta Sans* luring (*offline*), dan dialog modal modern tanpa `alert` / `confirm` bawaan browser.

### Fitur Antarmuka:
- 📊 **Dashboard Arus Kas**: Diagram batang bulanan kas masuk vs keluar dengan Chart.js, kartu statistik saldo, dan banner pengingat iuran.
- 💸 **Pencatatan & Filter Transaksi**: Filter kategori instan tanpa klik tombol, pencarian teks, dan paginasi interaktif.
- 👥 **Manajemen Anggota**: CRUD data anggota dengan modal form interaktif.
- 🗓️ **Kelola Iuran**: Generator tagihan bulanan massal dan konfirmasi pelunasan iuran.
- 🔔 **Pengingat Penunggak**: Daftar penunggak dengan tombol pintas kirim pengingat via WhatsApp.
- 🔐 **Autentikasi & Guard**: Halaman login modern 2-kolom dengan tombol 1-klik akun demo, proteksi route berdasarkan peran (*Bendahara* & *Anggota*).

---

## 🛠️ 2. Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (SPA Mode via `@sveltejs/adapter-static`)
- **Styling**: Tailwind CSS v4
- **Komponen UI**: Desain sistem mandiri (Button, Modal, StatCard, Badge, Toast, Table, EmptyState, Skeleton)
- **Ikon**: `lucide-svelte`
- **Tipografi**: `@fontsource-variable/plus-jakarta-sans` (self-hosted offline)
- **Visualisasi**: Chart.js
- **Hosting / Deploy**: Vercel (siap deploy dengan `vercel.json` bawaan)

---

## 🚀 3. Panduan Menjalankan Secara Lokal

Pastikan **Bun** atau **Node.js** sudah terpasang.

1. **Install Dependensi**:
   ```bash
   bun install
   # atau jika menggunakan npm:
   # npm install
   ```

2. **Konfigurasi Environment**:
   Salin `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
   Isi berkas `.env`:
   ```env
   PUBLIC_API_URL=http://localhost:5001/api
   ```

3. **Jalankan Server Development**:
   ```bash
   bun run dev
   # atau:
   # npm run dev
   ```
   Buka peramban di `http://localhost:5173`.

4. **Build Produksi SPA**:
   ```bash
   bun run build
   # atau:
   # npm run build
   ```
   Artefak statis akan dihasilkan di folder `build/` dengan entry point `build/index.html`.

---

## 🌐 4. Panduan Deploy ke Vercel

Repositori ini sudah dilengkapi berkas `vercel.json` dengan konfigurasi otomatis:

1. Buat proyek baru di [Vercel](https://vercel.com).
2. Hubungkan repositori GitHub ini.
3. Vercel akan otomatis mengenali SvelteKit dan menghasilkan build ke folder `build`.
4. Di bagian **Environment Variables** Vercel, tambahkan:
   - **Key**: `PUBLIC_API_URL`
   - **Value**: `https://<URL-BACKEND-ANDA>/api`
5. Klik **Deploy**.

---

## 👨‍💻 Pengembang
- **Nama**: Toman Sihombing
- **NIM**: 11S24034 / ifs24034
- **Mata Kuliah**: Praktikum Pengembangan Aplikasi Berbasis Web (PABWE)
- **Tahun**: 2026
