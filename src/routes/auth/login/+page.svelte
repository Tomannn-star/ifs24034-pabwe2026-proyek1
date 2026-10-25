<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth.js";
  import { authService } from "$lib/services/authService.js";
  import { validateUsername, validatePassword } from "$lib/utils/validators.js";
  import { extractErrorMessage } from "$lib/utils/errorHandler.js";
  import { goto } from "$app/navigation";
  import { ROUTES, APP_CONFIG } from "$lib/constants/index.js";
  import Button from "$lib/components/Button.svelte";
  import Input from "$lib/components/Input.svelte";
  import {
    Wallet,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    Coins,
    Sparkles,
    ArrowRight,
    UserPlus
  } from "lucide-svelte";

  let username = $state("");
  let password = $state("");
  let errorMessage = $state("");
  let isLoading = $state(false);

  onMount(() => {
    // Jika sudah login, langsung arahkan ke dashboard
    const unsubscribe = auth.subscribe((state) => {
      if (state.token && state.user) {
        goto(ROUTES.HOME);
      }
    });
    return unsubscribe;
  });

  async function handleLogin(e) {
    e.preventDefault();
    errorMessage = "";

    const usernameErr = validateUsername(username);
    if (usernameErr) {
      errorMessage = usernameErr;
      return;
    }

    const passwordErr = validatePassword(password);
    if (passwordErr) {
      errorMessage = passwordErr;
      return;
    }

    isLoading = true;
    try {
      await authService.login(username, password);
      goto(ROUTES.HOME);
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Username atau password salah");
    } finally {
      isLoading = false;
    }
  }

  // Helper untuk memudahkan pengisian akun demo
  function setDemoAccount(u, p) {
    username = u;
    password = p;
    errorMessage = "";
  }
</script>

<svelte:head>
  <title>Masuk - {APP_CONFIG.NAME}</title>
  <meta name="description" content="Masuk ke akun KasPintar untuk mengelola dan memantau uang kas kelas." />
</svelte:head>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
  <div class="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden grid lg:grid-cols-12 min-h-[580px]">
    
    <!-- ========================================================= -->
    <!-- KOLOM KIRI (Brand Showcase Fintech Panel)                 -->
    <!-- ========================================================= -->
    <div class="lg:col-span-5 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
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
    </div>

    <!-- ========================================================= -->
    <!-- KOLOM KANAN (Form Login Bersih & Modern)                  -->
    <!-- ========================================================= -->
    <div class="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
      <div class="max-w-md w-full mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang</h2>
          <p class="text-sm text-slate-600 mt-1">
            Masuk ke akun KasPintar untuk mengelola atau memantau kas kelas.
          </p>
        </div>

        {#if errorMessage}
          <div class="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs sm:text-sm animate-in fade-in duration-150">
            <AlertCircle class="w-5 h-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
            <div class="leading-snug">
              <span class="font-bold">Gagal Masuk:</span> {errorMessage}
            </div>
          </div>
        {/if}

        <form onsubmit={handleLogin} class="space-y-4">
          <!-- Input Username menggunakan Komponen Reusable Input -->
          <Input
            id="username"
            name="username"
            label="Username"
            bind:value={username}
            placeholder="Contoh: bendahara atau anggota1"
            required
            autocomplete="username"
            aria-label="Username"
          />

          <!-- Input Password menggunakan Komponen Reusable Input -->
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            bind:value={password}
            placeholder="Masukkan kata sandi akun"
            required
            autocomplete="current-password"
            aria-label="Password"
          />

          <!-- Tombol Submit (Selector #btn-submit untuk Grader Delcom) -->
          <div class="pt-2">
            <Button
              id="btn-submit"
              name="btn-submit"
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              class="w-full shadow-sm hover:shadow-md"
            >
              {#if !isLoading}
                <span>Masuk ke KasPintar</span>
                <ArrowRight class="w-4 h-4 ml-1" aria-hidden="true" />
              {/if}
            </Button>
          </div>
        </form>

        <!-- Tautan Menuju Halaman Register (/auth/register) -->
        <div class="mt-4 text-center">
          <p class="text-xs text-slate-600">
            Belum memiliki akun?
            <a href={ROUTES.REGISTER} class="font-bold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1">
              <UserPlus class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Daftar akun baru di sini</span>
            </a>
          </p>
        </div>

        <!-- Kotak Kecil Akun Demo (Discrete & Rapi) -->
        <div class="mt-6 pt-5 border-t border-slate-100">
          <div class="flex items-center justify-between mb-2.5">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Akun Demo Uji Coba:
            </span>
            <span class="text-[11px] text-teal-700 font-semibold">Klik untuk isi otomatis</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onclick={() => setDemoAccount("bendahara", "bendahara123")}
              class="p-2.5 text-left rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition cursor-pointer group"
            >
              <div class="font-bold text-slate-800 group-hover:text-teal-900 flex items-center justify-between">
                <span>Bendahara</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">Admin</span>
              </div>
              <div class="text-[11px] text-slate-600 font-mono mt-0.5">bendahara123</div>
            </button>

            <button
              type="button"
              onclick={() => setDemoAccount("anggota1", "anggota123")}
              class="p-2.5 text-left rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition cursor-pointer group"
            >
              <div class="font-bold text-slate-800 group-hover:text-teal-900 flex items-center justify-between">
                <span>Ahmad</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">Anggota 1</span>
              </div>
              <div class="text-[11px] text-slate-600 font-mono mt-0.5">anggota123</div>
            </button>

            <button
              type="button"
              onclick={() => setDemoAccount("anggota2", "anggota123")}
              class="p-2.5 text-left rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition cursor-pointer group"
            >
              <div class="font-bold text-slate-800 group-hover:text-rose-900 flex items-center justify-between">
                <span>Budi</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-semibold">Menunggak</span>
              </div>
              <div class="text-[11px] text-slate-600 font-mono mt-0.5">anggota123</div>
            </button>

            <button
              type="button"
              onclick={() => setDemoAccount("anggota3", "anggota123")}
              class="p-2.5 text-left rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer group"
            >
              <div class="font-bold text-slate-800 group-hover:text-emerald-900 flex items-center justify-between">
                <span>Citra</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">Lunas</span>
              </div>
              <div class="text-[11px] text-slate-600 font-mono mt-0.5">anggota123</div>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
