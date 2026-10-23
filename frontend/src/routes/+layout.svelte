<script>
  import "./layout.css";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/stores/auth.js";
  import { browser } from "$app/environment";

  let { children } = $props();

  let currentUser = $state(null);
  let token = $state(null);
  let isMobileMenuOpen = $state(false);

  // Subscribe ke state auth
  $effect(() => {
    const unsub = auth.subscribe((val) => {
      token = val.token;
      currentUser = val.user;
    });
    return unsub;
  });

  // Client-side route guard (hanya untuk UX navigasi)
  $effect(() => {
    if (!browser) return;

    const path = page.url.pathname;
    const isLoginPage = path === "/login";

    if (!token && !isLoginPage) {
      goto("/login");
    } else if (token && isLoginPage) {
      goto("/");
    } else if (token && currentUser?.role === "anggota") {
      const bendaharaOnly = ["/anggota", "/penunggak", "/kategori", "/transaksi/baru"];
      const isRestricted = bendaharaOnly.some((prefix) => path.startsWith(prefix));
      if (isRestricted) {
        goto("/");
      }
    }
  });

  function handleLogout() {
    auth.logout(true);
  }

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

{#if page.url.pathname === "/login"}
  {@render children()}
{:else}
  <div class="min-h-screen flex flex-col bg-slate-50/70 text-slate-800">
    <!-- Navbar Modern Glassmorphism -->
    <header class="bg-indigo-600/95 backdrop-blur-md text-white shadow-sm sticky top-0 z-40 border-b border-indigo-500/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Brand KasPintar -->
          <div class="flex items-center gap-3">
            <a href="/" class="flex items-center gap-2.5 group transition">
              <div class="w-9 h-9 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center text-xl transition shadow-inner">
                💰
              </div>
              <span class="font-extrabold text-xl tracking-tight text-white">KasPintar</span>
            </a>
            <span class="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-0.5 bg-indigo-700/70 rounded-full text-indigo-100 border border-indigo-400/30">
              Kas Kelas
            </span>
          </div>

          <!-- Menu Desktop Modern Nav Pills -->
          <nav class="hidden md:flex items-center gap-1 text-sm font-semibold">
            <a
              href="/"
              class="px-3 py-2 rounded-xl transition duration-150 {page.url.pathname === '/' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white hover:bg-white/10'}"
            >
              Dashboard
            </a>

            <a
              href="/transaksi"
              class="px-3 py-2 rounded-xl transition duration-150 {page.url.pathname.startsWith('/transaksi') ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white hover:bg-white/10'}"
            >
              Transaksi
            </a>

            <a
              href="/iuran"
              class="px-3 py-2 rounded-xl transition duration-150 {page.url.pathname === '/iuran' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white hover:bg-white/10'}"
            >
              {currentUser?.role === 'bendahara' ? 'Kelola Iuran' : 'Iuran Saya'}
            </a>

            {#if currentUser?.role === "bendahara"}
              <a
                href="/anggota"
                class="px-3 py-2 rounded-xl transition duration-150 {page.url.pathname === '/anggota' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white hover:bg-white/10'}"
              >
                Anggota
              </a>

              <a
                href="/penunggak"
                class="px-3 py-2 rounded-xl transition duration-150 {page.url.pathname === '/penunggak' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white hover:bg-white/10'}"
              >
                Penunggak
              </a>

              <a
                href="/kategori"
                class="px-3 py-2 rounded-xl transition duration-150 {page.url.pathname === '/kategori' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white hover:bg-white/10'}"
              >
                Kategori
              </a>
            {/if}
          </nav>

          <!-- User Profil & Logout Desktop -->
          <div class="hidden md:flex items-center gap-3 pl-3 border-l border-indigo-400/30">
            <div class="text-right">
              <div class="text-sm font-bold text-white leading-tight">{currentUser?.nama || currentUser?.username}</div>
              <div class="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold flex items-center justify-end gap-1">
                {#if currentUser?.role === 'bendahara'}
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                  <span>Bendahara</span>
                {:else}
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                  <span>Anggota</span>
                {/if}
              </div>
            </div>

            <button
              onclick={handleLogout}
              class="p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-xl transition duration-150"
              title="Keluar dari akun KasPintar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <!-- Mobile Hamburger -->
          <div class="flex md:hidden">
            <button
              onclick={toggleMobileMenu}
              class="p-2 rounded-xl text-indigo-100 hover:text-white hover:bg-white/10 transition"
              aria-label="Menu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {#if isMobileMenuOpen}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                {:else}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                {/if}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Dropdown Mobile Menu -->
      {#if isMobileMenuOpen}
        <div class="md:hidden border-t border-indigo-500/40 px-4 pt-3 pb-4 space-y-1 bg-indigo-700/95 backdrop-blur-md">
          <div class="py-2 mb-2 border-b border-indigo-600/60 flex items-center justify-between">
            <div>
              <div class="font-bold text-sm text-white">{currentUser?.nama || currentUser?.username}</div>
              <div class="text-xs text-indigo-200">
                {currentUser?.role === 'bendahara' ? '👑 Bendahara Kas' : '👤 Anggota'}
              </div>
            </div>
            <button
              onclick={handleLogout}
              class="text-xs px-3 py-1 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-lg"
            >
              Keluar
            </button>
          </div>

          <a
            href="/"
            onclick={() => isMobileMenuOpen = false}
            class="block px-3 py-2 rounded-xl text-sm font-semibold {page.url.pathname === '/' ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-white/10'}"
          >
            Dashboard
          </a>

          <a
            href="/transaksi"
            onclick={() => isMobileMenuOpen = false}
            class="block px-3 py-2 rounded-xl text-sm font-semibold {page.url.pathname.startsWith('/transaksi') ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-white/10'}"
          >
            Transaksi
          </a>

          <a
            href="/iuran"
            onclick={() => isMobileMenuOpen = false}
            class="block px-3 py-2 rounded-xl text-sm font-semibold {page.url.pathname === '/iuran' ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-white/10'}"
          >
            {currentUser?.role === 'bendahara' ? 'Kelola Iuran' : 'Iuran Saya'}
          </a>

          {#if currentUser?.role === "bendahara"}
            <a
              href="/anggota"
              onclick={() => isMobileMenuOpen = false}
              class="block px-3 py-2 rounded-xl text-sm font-semibold {page.url.pathname === '/anggota' ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-white/10'}"
            >
              Anggota
            </a>

            <a
              href="/penunggak"
              onclick={() => isMobileMenuOpen = false}
              class="block px-3 py-2 rounded-xl text-sm font-semibold {page.url.pathname === '/penunggak' ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-white/10'}"
            >
              Penunggak
            </a>

            <a
              href="/kategori"
              onclick={() => isMobileMenuOpen = false}
              class="block px-3 py-2 rounded-xl text-sm font-semibold {page.url.pathname === '/kategori' ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-white/10'}"
            >
              Kategori
            </a>
          {/if}
        </div>
      {/if}
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      {@render children()}
    </main>

    <!-- Modern Minimalist Footer -->
    <footer class="bg-white/60 border-t border-slate-200/70 py-4 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 font-semibold text-slate-600">
          <span>💰 KasPintar</span> &mdash; Sistem Pencatatan Uang Kas Kelas
        </div>
        <div class="text-[11px] text-slate-400">
          Pengembangan Aplikasi Berbasis Web &bull; 2026
        </div>
      </div>
    </footer>
  </div>
{/if}
