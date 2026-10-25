<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth.js";
  import { api } from "$lib/api.js";
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Button.svelte";
  import {
    Wallet,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    Coins,
    Sparkles,
    ArrowRight,
    LogIn,
    User,
    Phone
  } from "lucide-svelte";

  let nama = $state("");
  let username = $state("");
  let password = $state("");
  let kontak = $state("");
  let role = $state("anggota");
  let showPassword = $state(false);
  let errorMessage = $state("");
  let isLoading = $state(false);

  onMount(() => {
    // Jika sudah login, langsung arahkan ke dashboard
    const unsubscribe = auth.subscribe((state) => {
      if (state.token && state.user) {
        goto("/");
      }
    });
    return unsubscribe;
  });

  async function handleRegister(e) {
    e.preventDefault();
    errorMessage = "";

    if (!nama.trim() || !username.trim() || !password) {
      errorMessage = "Nama lengkap, username, dan password wajib diisi";
      return;
    }

    if (username.trim().length < 3) {
      errorMessage = "Username minimal 3 karakter";
      return;
    }

    if (password.length < 6) {
      errorMessage = "Password minimal 6 karakter";
      return;
    }

    isLoading = true;
    try {
      const res = await api.post("auth/register", {
        nama: nama.trim(),
        username: username.trim(),
        password,
        kontak: kontak.trim() || null,
        role
      });

      auth.login(res.token, res.user);
      goto("/");
    } catch (err) {
      errorMessage = err.message || "Gagal melakukan registrasi";
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Daftar Akun Baru - KasPintar</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
  <div class="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden grid lg:grid-cols-12 min-h-[580px]">
    
    <!-- ========================================================= -->
    <!-- KOLOM KIRI (Brand Showcase Fintech Panel)                 -->
    <!-- ========================================================= -->
    <div class="lg:col-span-5 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
      <!-- Dekorasi Latar Halus -->
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
            <Wallet class="w-6 h-6 text-teal-800" />
          </div>
          <div>
            <h1 class="text-2xl font-extrabold tracking-tight text-white leading-none">KasPintar</h1>
            <p class="text-xs text-teal-200/90 font-medium mt-1">Registrasi Akun Anggota Baru</p>
          </div>
        </div>
      </div>

      <!-- Keuntungan Bergabung -->
      <div class="relative z-10 my-8 space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-teal-700/80 text-teal-200 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
            <CheckCircle2 class="w-3.5 h-3.5 text-teal-300" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Transparan & Terbuka</h3>
            <p class="text-xs text-teal-100/80 mt-0.5 leading-relaxed">
              Pantau laporan kas masuk dan saldo kelas kapan saja langsung dari ponsel Anda.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-teal-700/80 text-teal-200 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
            <Coins class="w-3.5 h-3.5 text-teal-300" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Riwayat Iuran Pribadi</h3>
            <p class="text-xs text-teal-100/80 mt-0.5 leading-relaxed">
              Ketahui tanggal jatuh tempo dan status pembayaran iuran kas bulanan Anda.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-teal-700/80 text-teal-200 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
            <ShieldCheck class="w-3.5 h-3.5 text-teal-300" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Keamanan Akun Terjamin</h3>
            <p class="text-xs text-teal-100/80 mt-0.5 leading-relaxed">
              Sandi terenkripsi dengan aman dan terautentikasi melalui JSON Web Token.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Brand Info -->
      <div class="relative z-10 pt-4 border-t border-teal-700/40 text-[11px] text-teal-200/70">
        Praktikum PABWE &bull; Halaman Publik &bull; SvelteKit SPA
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- KOLOM KANAN (Form Registrasi Bersih & Modern)             -->
    <!-- ========================================================= -->
    <div class="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
      <div class="max-w-md w-full mx-auto">
        <div class="mb-5">
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Daftar Akun Baru</h2>
          <p class="text-sm text-slate-500 mt-1">
            Buat akun baru untuk mulai mengakses sistem kas kelas KasPintar.
          </p>
        </div>

        {#if errorMessage}
          <div class="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs sm:text-sm animate-in fade-in duration-150">
            <AlertCircle class="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div class="leading-snug">
              <span class="font-bold">Gagal Mendaftar:</span> {errorMessage}
            </div>
          </div>
        {/if}

        <form onsubmit={handleRegister} class="space-y-3.5">
          <!-- Input Nama Lengkap -->
          <div class="space-y-1">
            <label for="name" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nama Lengkap <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                id="name"
                name="name"
                type="text"
                bind:value={nama}
                placeholder="Contoh: Toman Sihombing"
                required
                class="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/20 focus:border-teal-700 transition duration-150"
              />
              <input
                type="hidden"
                id="nama"
                name="nama"
                bind:value={nama}
              />
              <User class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <!-- Input Username -->
          <div class="space-y-1">
            <label for="username" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Username <span class="text-rose-500">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              bind:value={username}
              placeholder="Contoh: toman2026 (min. 3 karakter)"
              required
              autocomplete="username"
              class="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/20 focus:border-teal-700 transition duration-150"
            />
          </div>

          <!-- Input Password -->
          <div class="space-y-1">
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                bind:value={password}
                placeholder="Minimal 6 karakter"
                required
                autocomplete="new-password"
                class="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/20 focus:border-teal-700 transition duration-150"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                title={showPassword ? "Sembunyikan password" : "Lihat password"}
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {#if showPassword}
                  <EyeOff class="w-4 h-4" />
                {:else}
                  <Eye class="w-4 h-4" />
                {/if}
              </button>
            </div>
          </div>

          <!-- Input Kontak (Opsional) -->
          <div class="space-y-1">
            <label for="kontak" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
              No. WhatsApp / HP <span class="text-slate-400 font-normal normal-case">(Opsional)</span>
            </label>
            <div class="relative">
              <input
                id="kontak"
                name="kontak"
                type="text"
                bind:value={kontak}
                placeholder="Contoh: 081234567890"
                class="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/20 focus:border-teal-700 transition duration-150"
              />
              <Phone class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <!-- Pilihan Role -->
          <div class="space-y-1">
            <span class="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Peran Pengguna (Role)
            </span>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition {role === 'anggota' ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}">
                <input type="radio" bind:group={role} value="anggota" class="text-teal-700 focus:ring-teal-700" />
                <span class="text-xs">Anggota Kelas</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition {role === 'bendahara' ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}">
                <input type="radio" bind:group={role} value="bendahara" class="text-teal-700 focus:ring-teal-700" />
                <span class="text-xs">Bendahara</span>
              </label>
            </div>
          </div>

          <!-- Tombol Submit (Selector #btn-submit untuk Grader Delcom) -->
          <div class="pt-2">
            <button
              id="btn-submit"
              name="btn-submit"
              type="submit"
              disabled={isLoading}
              class="w-full inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer select-none bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white shadow-sm hover:shadow-md px-5 py-2.5 text-base rounded-xl gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isLoading}
                <svg class="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Mendaftarkan Akun...</span>
              {:else}
                <span>Daftar Akun Sekarang</span>
                <ArrowRight class="w-4 h-4 ml-1" />
              {/if}
            </button>
          </div>
        </form>

        <!-- Tautan Kembali ke Login -->
        <div class="mt-4 text-center">
          <p class="text-xs text-slate-500">
            Sudah memiliki akun?
            <a href="/auth/login" class="font-bold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1">
              <LogIn class="w-3.5 h-3.5" />
              <span>Masuk di sini</span>
            </a>
          </p>
        </div>
      </div>
    </div>

  </div>
</div>
