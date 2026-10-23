<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth.js";
  import { api } from "$lib/api.js";
  import { goto } from "$app/navigation";

  let username = $state("");
  let password = $state("");
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

  async function handleLogin(e) {
    e.preventDefault();
    errorMessage = "";

    if (!username.trim() || !password) {
      errorMessage = "Username dan password wajib diisi";
      return;
    }

    isLoading = true;
    try {
      const res = await api.post("auth/login", {
        username: username.trim(),
        password
      });

      auth.login(res.token, res.user);
      goto("/");
    } catch (err) {
      errorMessage = err.message || "Username atau password salah";
    } finally {
      isLoading = false;
    }
  }

  // Helper untuk memudahkan penguji / dosen login dengan akun demo
  function setDemoAccount(u, p) {
    username = u;
    password = p;
    errorMessage = "";
  }
</script>

<svelte:head>
  <title>Login - KasPintar</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
    <!-- Header Banner -->
    <div class="bg-indigo-600 p-8 text-center text-white">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm shadow-inner">
        <span class="text-3xl">💰</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight">KasPintar</h1>
      <p class="text-indigo-100 text-sm mt-1">Sistem Pencatatan Uang Kas Kelas</p>
    </div>

    <div class="p-8">
      {#if errorMessage}
        <div class="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2.5">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      {/if}

      <form onsubmit={handleLogin} class="space-y-4">
        <div>
          <label for="username" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Username
          </label>
          <input
            id="username"
            type="text"
            bind:value={username}
            placeholder="Masukkan username kamu"
            required
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
          />
        </div>

        <div>
          <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="Masukkan kata sandi"
            required
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          class="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {#if isLoading}
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Memproses Masuk...</span>
          {:else}
            <span>Masuk ke KasPintar</span>
          {/if}
        </button>
      </form>

      <!-- Akun Demo Cepat untuk Uji Coba -->
      <div class="mt-8 pt-6 border-t border-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
          Akun Demo Siap Pakai:
        </p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onclick={() => setDemoAccount("bendahara", "bendahara123")}
            class="p-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-left transition font-medium"
          >
            <div class="font-bold text-slate-800">👑 Bendahara</div>
            <div class="text-slate-500 text-[11px]">bendahara / bendahara123</div>
          </button>

          <button
            type="button"
            onclick={() => setDemoAccount("anggota1", "anggota123")}
            class="p-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-left transition font-medium"
          >
            <div class="font-bold text-slate-800">👤 Anggota 1</div>
            <div class="text-slate-500 text-[11px]">Ahmad (Lunas s/d Sept)</div>
          </button>

          <button
            type="button"
            onclick={() => setDemoAccount("anggota2", "anggota123")}
            class="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-lg text-left transition font-medium"
          >
            <div class="font-bold text-slate-800">⚠️ Anggota 2</div>
            <div class="text-slate-500 text-[11px]">Budi (Ada Tunggakan)</div>
          </button>

          <button
            type="button"
            onclick={() => setDemoAccount("anggota3", "anggota123")}
            class="p-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-lg text-left transition font-medium"
          >
            <div class="font-bold text-slate-800">✅ Anggota 3</div>
            <div class="text-slate-500 text-[11px]">Citra (Semua Lunas)</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
