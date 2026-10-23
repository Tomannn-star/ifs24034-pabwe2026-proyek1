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
      // Proteksi rute khusus bendahara di sisi UI
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
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <!-- Navbar Atas -->
    <header class="bg-indigo-600 text-white shadow-md sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Brand KasPintar -->
          <div class="flex items-center gap-3">
            <a href="/" class="flex items-center gap-2.5 font-bold text-xl tracking-tight hover:opacity-90 transition">
              <span class="text-2xl">💰</span>
              <span>KasPintar</span>
            </a>
            <span class="hidden sm:inline-block text-xs font-medium px-2 py-0.5 bg-indigo-700/60 rounded-full text-indigo-100 border border-indigo-500/40">
              Kas Kelas
            </span>
          </div>

          <!-- Menu Desktop -->
          <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
            <a
              href="/"
              class="px-3 py-2 rounded-lg transition {page.url.pathname === '/' ? 'bg-indigo-700 text-white font-semibold' : 'text-indigo-100 hover:bg-indigo-500/50'}"
            >
              Dashboard
            </a>

            <a
              href="/transaksi"
              class="px-3 py-2 rounded-lg transition {page.url.pathname.startsWith('/transaksi') ? 'bg-indigo-700 text-white font-semibold' : 'text-indigo-100 hover:bg-indigo-500/50'}"
            >
              Transaksi
            </a>

            <a
              href="/iuran"
              class="px-3 py-2 rounded-lg transition {page.url.pathname === '/iuran' ? 'bg-indigo-700 text-white font-semibold' : 'text-indigo-100 hover:bg-indigo-500/50'}"
            >
              {currentUser?.role === 'bendahara' ? 'Kelola Iuran' : 'Iuran Saya'}
            </a>

            {#if currentUser?.role === "bendahara"}
              <a
                href="/anggota"
                class="px-3 py-2 rounded-lg transition {page.url.pathname === '/anggota' ? 'bg-indigo-700 text-white font-semibold' : 'text-indigo-100 hover:bg-indigo-500/50'}"
              >
                Anggota
              </a>

              <a
                href="/penunggak"
                class="px-3 py-2 rounded-lg transition {page.url.pathname === '/penunggak' ? 'bg-indigo-700 text-white font-semibold' : 'text-indigo-100 hover:bg-indigo-500/50'}"
              >
                Penunggak
              </a>

              <a
                href="/kategori"
                class="px-3 py-2 rounded-lg transition {page.url.pathname === '/kategori' ? 'bg-indigo-700 text-white font-semibold' : 'text-indigo-100 hover:bg-indigo-500/50'}"
              >
                Kategori
              </a>
            {/if}
          </nav>

          <!-- User Profil & Logout Desktop -->
          <div class="hidden md:flex items-center gap-3">
            <div class="text-right">
              <div class="text-sm font-semibold leading-tight text-white">{currentUser?.nama || currentUser?.username}</div>
              <div class="text-[11px] text-indigo-200 uppercase tracking-wider font-medium">
                {currentUser?.role === 'bendahara' ? '👑 Bendahara' : '👤 Anggota'}
              </div>
            </div>
            <button
              onclick={handleLogout}
              class="p-2 text-indigo-100 hover:text-white hover:bg-indigo-700 rounded-lg transition"
              title="Keluar dari sistem"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <!-- Tombol Mobile Menu Hamburger -->
          <div class="flex md:hidden">
            <button
              onclick={toggleMobileMenu}
              class="p-2 rounded-lg text-indigo-100 hover:text-white hover:bg-indigo-700 transition"
              aria-label="Buka Menu"
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

      <!-- Menu Dropdown Mobile -->
      {#if isMobileMenuOpen}
        <div class="md:hidden border-t border-indigo-500/40 px-4 pt-2 pb-4 space-y-1 bg-indigo-700">
          <div class="py-2 mb-2 border-b border-indigo-600/50 flex items-center justify-between">
            <div>
              <div class="font-bold text-sm text-white">{currentUser?.nama || currentUser?.username}</div>
              <div class="text-xs text-indigo-200">{currentUser?.role === 'bendahara' ? '👑 Bendahara Kas' : '👤 Anggota'}</div>
            </div>
            <button
              onclick={handleLogout}
              class="text-xs px-2.5 py-1 bg-indigo-800 text-indigo-100 hover:text-white rounded-md"
            >
              Keluar
            </button>
          </div>

          <a
            href="/"
            onclick={() => isMobileMenuOpen = false}
            class="block px-3 py-2 rounded-md text-sm {page.url.pathname === '/' ? 'bg-indigo-800 text-white font-bold' : 'text-indigo-100'}"
          >
            Dashboard
          </a>

          <a
            href="/transaksi"
            onclick={() => isMobileMenuOpen = false}
            class="block px-3 py-2 rounded-md text-sm {page.url.pathname.startsWith('/transaksi') ? 'bg-indigo-800 text-white font-bold' : 'text-indigo-100'}"
          >
            Transaksi
          </a>

          <a
            href="/iuran"
            onclick={() => isMobileMenuOpen = false}
            class="block px-3 py-2 rounded-md text-sm {page.url.pathname === '/iuran' ? 'bg-indigo-800 text-white font-bold' : 'text-indigo-100'}"
          >
            {currentUser?.role === 'bendahara' ? 'Kelola Iuran' : 'Iuran Saya'}
          </a>

          {#if currentUser?.role === "bendahara"}
            <a
              href="/anggota"
              onclick={() => isMobileMenuOpen = false}
              class="block px-3 py-2 rounded-md text-sm {page.url.pathname === '/anggota' ? 'bg-indigo-800 text-white font-bold' : 'text-indigo-100'}"
            >
              Anggota
            </a>

            <a
              href="/penunggak"
              onclick={() => isMobileMenuOpen = false}
              class="block px-3 py-2 rounded-md text-sm {page.url.pathname === '/penunggak' ? 'bg-indigo-800 text-white font-bold' : 'text-indigo-100'}"
            >
              Penunggak
            </a>

            <a
              href="/kategori"
              onclick={() => isMobileMenuOpen = false}
              class="block px-3 py-2 rounded-md text-sm {page.url.pathname === '/kategori' ? 'bg-indigo-800 text-white font-bold' : 'text-indigo-100'}"
            >
              Kategori
            </a>
          {/if}
        </div>
      {/if}
    </header>

    <!-- Konten Halaman Utama -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      {@render children()}
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4">
        &copy; 2026 <strong>KasPintar</strong> &mdash; Sistem Pencatatan Uang Kas Kelas.
      </div>
    </footer>
  </div>
{/if}
