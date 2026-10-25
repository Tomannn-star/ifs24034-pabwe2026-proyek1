<script>
  import "./layout.css";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/stores/auth.js";
  import { browser } from "$app/environment";
  import Toast from "$lib/components/Toast.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import {
    LayoutDashboard,
    Receipt,
    CalendarClock,
    Users,
    AlertTriangle,
    Tag,
    LogOut,
    Menu,
    X,
    Wallet
  } from "lucide-svelte";

  let { children } = $props();

  let currentUser = $state(null);
  let token = $state(null);
  let isMobileDrawerOpen = $state(false);

  // Subscribe ke status autentikasi
  $effect(() => {
    const unsub = auth.subscribe((val) => {
      token = val.token;
      currentUser = val.user;
    });
    return unsub;
  });

  // Client-side route guard untuk halaman terproteksi & publik
  $effect(() => {
    if (!browser) return;

    const path = page.url.pathname;
    const isPublicPage = path.startsWith("/auth/") || path === "/login";

    if (!token && !isPublicPage) {
      goto("/auth/login");
    } else if (token && isPublicPage) {
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
    isMobileDrawerOpen = false;
    auth.logout(true);
  }

  function getInitials(name) {
    if (!name) return "KP";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
</script>

<svelte:head>
  <title>KasPintar - Sistem Pencatatan Uang Kas Kelas</title>
</svelte:head>

<!-- Komponen Notifikasi Toast Global -->
<Toast />

{#if page.url.pathname.startsWith("/auth/") || page.url.pathname === "/login"}
  {@render children()}
{:else}
  <div class="min-h-screen bg-slate-50 text-slate-800 flex">
    <!-- ========================================================= -->
    <!-- SIDEBAR DESKTOP (Linear / Mercury Modern Fintech Style)   -->
    <!-- ========================================================= -->
    <aside class="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-200/80 fixed inset-y-0 left-0 z-30 select-none">
      <!-- Brand Header -->
      <div class="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
        <a href="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs transition group-hover:scale-105 duration-150">
            <Wallet class="w-5 h-5 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-lg text-slate-900 tracking-tight leading-none">KasPintar</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500" title="Aktif"></span>
            </div>
            <p class="text-[11px] font-medium text-slate-600 mt-1">Uang Kas Kelas</p>
          </div>
        </a>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <!-- Grup: Utama -->
        <div>
          <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
            Menu Utama
          </p>
          <div class="space-y-1">
            <a
              href="/"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 {page.url.pathname === '/' ? 'bg-teal-50 text-teal-800 font-semibold shadow-2xs border border-teal-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
            >
              <LayoutDashboard class="w-4 h-4 {page.url.pathname === '/' ? 'text-teal-700' : 'text-slate-500'}" aria-hidden="true" />
              <span>Dashboard</span>
            </a>

            <a
              href="/transaksi"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 {page.url.pathname.startsWith('/transaksi') ? 'bg-teal-50 text-teal-800 font-semibold shadow-2xs border border-teal-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
            >
              <Receipt class="w-4 h-4 {page.url.pathname.startsWith('/transaksi') ? 'text-teal-700' : 'text-slate-500'}" aria-hidden="true" />
              <span>Transaksi</span>
            </a>

            <a
              href="/iuran"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 {page.url.pathname === '/iuran' ? 'bg-teal-50 text-teal-800 font-semibold shadow-2xs border border-teal-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
            >
              <CalendarClock class="w-4 h-4 {page.url.pathname === '/iuran' ? 'text-teal-700' : 'text-slate-500'}" aria-hidden="true" />
              <span>{currentUser?.role === 'bendahara' ? 'Kelola Iuran' : 'Iuran Saya'}</span>
            </a>
          </div>
        </div>

        <!-- Grup: Administrasi (Khusus Bendahara) -->
        {#if currentUser?.role === "bendahara"}
          <div>
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              Administrasi
            </p>
            <div class="space-y-1">
              <a
                href="/anggota"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 {page.url.pathname === '/anggota' ? 'bg-teal-50 text-teal-800 font-semibold shadow-2xs border border-teal-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
              >
                <Users class="w-4 h-4 {page.url.pathname === '/anggota' ? 'text-teal-700' : 'text-slate-500'}" aria-hidden="true" />
                <span>Anggota</span>
              </a>

              <a
                href="/penunggak"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 {page.url.pathname === '/penunggak' ? 'bg-rose-50 text-rose-800 font-semibold shadow-2xs border border-rose-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
              >
                <AlertTriangle class="w-4 h-4 {page.url.pathname === '/penunggak' ? 'text-rose-600' : 'text-slate-500'}" aria-hidden="true" />
                <span>Penunggak</span>
              </a>

              <a
                href="/kategori"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 {page.url.pathname === '/kategori' ? 'bg-teal-50 text-teal-800 font-semibold shadow-2xs border border-teal-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
              >
                <Tag class="w-4 h-4 {page.url.pathname === '/kategori' ? 'text-teal-700' : 'text-slate-500'}" aria-hidden="true" />
                <span>Kategori</span>
              </a>
            </div>
          </div>
        {/if}
      </nav>

      <!-- User Profile & Logout Bottom Card -->
      <div class="p-4 border-t border-slate-100 bg-slate-50/60">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/60 shadow-2xs">
              {getInitials(currentUser?.nama || currentUser?.username)}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-800 truncate leading-tight">
                {currentUser?.nama || currentUser?.username}
              </p>
              <div class="mt-0.5">
                {#if currentUser?.role === "bendahara"}
                  <Badge variant="amber" size="sm">Bendahara</Badge>
                {:else}
                  <Badge variant="primary" size="sm">Anggota</Badge>
                {/if}
              </div>
            </div>
          </div>

          <button
            type="button"
            onclick={handleLogout}
            id="btn-logout"
            name="btn-logout"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100/80 rounded-xl transition duration-150 shrink-0 cursor-pointer border border-rose-200/50"
            title="Keluar dari KasPintar"
            aria-label="Logout"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- ========================================================= -->
    <!-- MOBILE TOP BAR & DRAWER                                   -->
    <!-- ========================================================= -->
    <div class="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between z-30 shadow-2xs">
      <a href="/" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-xs">
          <Wallet class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-base text-slate-900 tracking-tight">KasPintar</span>
      </a>

      <button
        type="button"
        onclick={() => (isMobileDrawerOpen = !isMobileDrawerOpen)}
        class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        aria-label={isMobileDrawerOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
      >
        {#if isMobileDrawerOpen}
          <X class="w-5 h-5" aria-hidden="true" />
        {:else}
          <Menu class="w-5 h-5" aria-hidden="true" />
        {/if}
      </button>
    </div>

    <!-- Mobile Drawer Overlay -->
    {#if isMobileDrawerOpen}
      <div
        class="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 animate-in fade-in duration-150"
        onclick={() => (isMobileDrawerOpen = false)}
        onkeydown={(e) => e.key === 'Escape' && (isMobileDrawerOpen = false)}
        role="button"
        tabindex="0"
        aria-label="Tutup menu navigasi"
      ></div>

      <div class="lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200">
        <div>
          <!-- Drawer Header -->
          <div class="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                <Wallet class="w-4 h-4 text-white" />
              </div>
              <span class="font-bold text-base text-slate-900">KasPintar</span>
            </div>
            <button
              type="button"
              onclick={() => (isMobileDrawerOpen = false)}
              class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label="Tutup Menu"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Drawer Navigation -->
          <nav class="p-3 space-y-4">
            <div>
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Menu Utama
              </p>
              <div class="space-y-1">
                <a
                  href="/"
                  onclick={() => (isMobileDrawerOpen = false)}
                  class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium {page.url.pathname === '/' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}"
                >
                  <LayoutDashboard class="w-4 h-4 text-teal-700" />
                  <span>Dashboard</span>
                </a>

                <a
                  href="/transaksi"
                  onclick={() => (isMobileDrawerOpen = false)}
                  class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium {page.url.pathname.startsWith('/transaksi') ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}"
                >
                  <Receipt class="w-4 h-4 text-teal-700" />
                  <span>Transaksi</span>
                </a>

                <a
                  href="/iuran"
                  onclick={() => (isMobileDrawerOpen = false)}
                  class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium {page.url.pathname === '/iuran' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}"
                >
                  <CalendarClock class="w-4 h-4 text-teal-700" />
                  <span>{currentUser?.role === 'bendahara' ? 'Kelola Iuran' : 'Iuran Saya'}</span>
                </a>
              </div>
            </div>

            {#if currentUser?.role === "bendahara"}
              <div>
                <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Administrasi
                </p>
                <div class="space-y-1">
                  <a
                    href="/anggota"
                    onclick={() => (isMobileDrawerOpen = false)}
                    class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium {page.url.pathname === '/anggota' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}"
                  >
                    <Users class="w-4 h-4 text-teal-700" />
                    <span>Anggota</span>
                  </a>

                  <a
                    href="/penunggak"
                    onclick={() => (isMobileDrawerOpen = false)}
                    class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium {page.url.pathname === '/penunggak' ? 'bg-rose-50 text-rose-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}"
                  >
                    <AlertTriangle class="w-4 h-4 text-rose-600" />
                    <span>Penunggak</span>
                  </a>

                  <a
                    href="/kategori"
                    onclick={() => (isMobileDrawerOpen = false)}
                    class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium {page.url.pathname === '/kategori' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}"
                  >
                    <Tag class="w-4 h-4 text-teal-700" />
                    <span>Kategori</span>
                  </a>
                </div>
              </div>
            {/if}
          </nav>
        </div>

        <!-- Drawer User Card -->
        <div class="p-4 border-t border-slate-100 bg-slate-50">
          <div class="flex items-center justify-between">
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-800 truncate">{currentUser?.nama || currentUser?.username}</p>
              <p class="text-xs text-slate-500 capitalize">{currentUser?.role}</p>
            </div>
            <button
              type="button"
              onclick={handleLogout}
              id="btn-logout-mobile"
              name="btn-logout"
              class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- ========================================================= -->
    <!-- MAIN CONTENT AREA                                         -->
    <!-- ========================================================= -->
    <div class="flex-1 min-w-0 flex flex-col min-h-screen lg:pl-64 xl:pl-72 pt-16 lg:pt-0">
      <main class="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {@render children()}
      </main>

      <!-- Minimalist Clean Footer -->
      <footer class="border-t border-slate-200/80 bg-white/70 py-4 px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-700">KasPintar</span>
            <span class="text-slate-300">&bull;</span>
            <span>Sistem Pencatatan Uang Kas Kelas</span>
          </div>
          <div class="text-[11px] text-slate-400">
            Praktikum Pengembangan Aplikasi Berbasis Web &bull; 2026
          </div>
        </div>
      </footer>
    </div>
  </div>
{/if}
