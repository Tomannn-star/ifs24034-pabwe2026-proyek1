<script>
  import { APP_CONFIG } from "$lib/constants/index.js";
  import {
    Wallet,
    CheckCircle2,
    ShieldCheck,
    Coins,
    Sparkles
  } from "lucide-svelte";

  let { children } = $props();
</script>

<main id="main-content" class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
  <div class="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden grid lg:grid-cols-12 min-h-[580px]">
    
    <!-- ========================================================= -->
    <!-- KOLOM KIRI (Brand Showcase Fintech Panel Bersama)         -->
    <!-- ========================================================= -->
    <aside aria-label="Informasi KasPintar" class="lg:col-span-5 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
      <!-- Latar Halus -->
      <div class="absolute -top-24 -left-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header Brand -->
      <div class="relative z-10">
        <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-teal-200 mb-6">
          <Sparkles class="w-3.5 h-3.5 text-teal-300" />
          <span>Sistem Kas Kelas Modern</span>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-white text-teal-900 flex items-center justify-center shadow-lg">
            <Wallet class="w-6 h-6 text-teal-800" aria-hidden="true" />
          </div>
          <div>
            <h1 class="text-2xl font-extrabold tracking-tight text-white leading-none">{APP_CONFIG.NAME}</h1>
            <p class="text-xs text-teal-100 font-medium mt-1">Transparansi Keuangan Kelas</p>
          </div>
        </div>
      </div>

      <!-- Feature Bullets -->
      <div class="relative z-10 my-8 space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-teal-700/80 text-teal-200 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
            <CheckCircle2 class="w-3.5 h-3.5 text-teal-300" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Transparansi Real-Time</h2>
            <p class="text-xs text-teal-50 mt-0.5 leading-relaxed">
              Semua mutasi kas masuk & keluar tercatat terbuka untuk seluruh anggota.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-teal-700/80 text-teal-200 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
            <Coins class="w-3.5 h-3.5 text-teal-300" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Pelacakan Iuran Akurat</h2>
            <p class="text-xs text-teal-50 mt-0.5 leading-relaxed">
              Otomatis hitung status lunas, belum bayar, dan tanggal jatuh tempo.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-teal-700/80 text-teal-200 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
            <ShieldCheck class="w-3.5 h-3.5 text-teal-300" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Akses Akun Terpisah</h2>
            <p class="text-xs text-teal-50 mt-0.5 leading-relaxed">
              Peran bendahara untuk mengelola kas, dan peran anggota untuk memantau.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Brand Info -->
      <div class="relative z-10 pt-4 border-t border-teal-700/40 text-[11px] text-teal-100">
        Praktikum PABWE &bull; Bun &bull; SvelteKit SPA
      </div>
    </aside>

    <!-- ========================================================= -->
    <!-- KOLOM KANAN (Konten Halaman Spesifik: Login / Register)    -->
    <!-- ========================================================= -->
    <section aria-label="Formulir Autentikasi" class="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
      <div class="max-w-md w-full mx-auto">
        {@render children()}
      </div>
    </section>

  </div>
</main>

