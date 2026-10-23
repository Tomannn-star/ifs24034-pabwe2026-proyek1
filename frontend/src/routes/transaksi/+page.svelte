<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { auth } from "$lib/stores/auth.js";
  import { formatRupiah, formatTanggal } from "$lib/utils/format.js";

  let currentUser = $state(null);
  let transactions = $state([]);
  let categories = $state([]);
  let pagination = $state({ page: 1, limit: 10, total: 0, totalPages: 1 });
  let isLoading = $state(true);
  let errorMessage = $state("");
  let successMessage = $state("");

  // Filter state
  let filterJenis = $state("");
  let filterCategoryId = $state("");
  let filterDari = $state("");
  let filterSampai = $state("");
  let searchKeyword = $state("");
  let searchDebounceTimer = null;

  $effect(() => {
    const unsub = auth.subscribe((s) => (currentUser = s.user));
    return unsub;
  });

  onMount(async () => {
    await Promise.all([loadCategories(), loadTransactions(1)]);
  });

  async function loadCategories() {
    try {
      const res = await api.get("categories");
      categories = res.data || [];
    } catch (e) {
      console.error("Gagal memuat kategori:", e);
    }
  }

  async function loadTransactions(targetPage = 1) {
    isLoading = true;
    errorMessage = "";
    try {
      const queryParams = new URLSearchParams({
        page: String(targetPage),
        limit: String(pagination.limit)
      });

      if (filterJenis) queryParams.set("jenis", filterJenis);
      if (filterCategoryId) queryParams.set("category_id", filterCategoryId);
      if (filterDari) queryParams.set("dari", filterDari);
      if (filterSampai) queryParams.set("sampai", filterSampai);
      if (searchKeyword.trim()) queryParams.set("q", searchKeyword.trim());

      const res = await api.get(`transactions?${queryParams.toString()}`);
      transactions = res.data || [];
      pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
    } catch (err) {
      errorMessage = err.message || "Gagal memuat data transaksi";
    } finally {
      isLoading = false;
    }
  }

  // Filter instan saat kategori, jenis, atau tanggal berubah (tanpa tombol saring)
  function handleFilterInstant() {
    loadTransactions(1);
  }

  // Pilih kategori via pill tab instan
  function selectCategoryPill(catId) {
    filterCategoryId = catId;
    loadTransactions(1);
  }

  // Pilih jenis via pill tab instan
  function selectJenisPill(j) {
    filterJenis = j;
    // Jika jenis berubah, reset kategori jika tidak cocok
    if (filterCategoryId) {
      const selectedCat = categories.find((c) => String(c.id) === String(filterCategoryId));
      if (selectedCat && j && selectedCat.jenis !== j) {
        filterCategoryId = "";
      }
    }
    loadTransactions(1);
  }

  // Pencarian otomatis dengan debounce 300ms saat mengetik
  function handleSearchInput() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      loadTransactions(1);
    }, 300);
  }

  function handleResetFilter() {
    filterJenis = "";
    filterCategoryId = "";
    filterDari = "";
    filterSampai = "";
    searchKeyword = "";
    loadTransactions(1);
  }

  async function handleDelete(id, keterangan) {
    const confirmDelete = window.confirm(`Apakah kamu yakin ingin menghapus transaksi: "${keterangan || 'Transaksi #' + id}"?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`transactions/${id}`);
      successMessage = "Transaksi berhasil dihapus";
      setTimeout(() => (successMessage = ""), 3000);
      loadTransactions(pagination.page);
    } catch (err) {
      errorMessage = err.message || "Gagal menghapus transaksi";
    }
  }

  let isAnyFilterActive = $derived(
    Boolean(filterJenis || filterCategoryId || filterDari || filterSampai || searchKeyword)
  );

  let activeCategoryPills = $derived(
    filterJenis ? categories.filter((c) => c.jenis === filterJenis) : categories
  );
</script>

<svelte:head>
  <title>Daftar Transaksi - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header Page & CTA Button -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
    <div>
      <div class="flex items-center gap-2">
        <span class="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-lg">📑</span>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Transaksi Kas</h1>
      </div>
      <p class="text-slate-500 text-sm mt-0.5">
        Riwayat catatan arus kas masuk dan kas keluar kas kelas secara transparan.
      </p>
    </div>
    {#if currentUser?.role === "bendahara"}
      <a
        href="/transaksi/baru"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition"
      >
        <span class="text-base">＋</span> Catat Transaksi Baru
      </a>
    {/if}
  </div>

  {#if successMessage}
    <div class="p-4 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 rounded-2xl text-sm flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-2">
        <span>✓</span>
        <span class="font-medium">{successMessage}</span>
      </div>
    </div>
  {/if}

  {#if errorMessage}
    <div class="p-4 bg-rose-50/90 border border-rose-200/80 text-rose-800 rounded-2xl text-sm flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-2">
        <span>⚠️</span>
        <span class="font-medium">{errorMessage}</span>
      </div>
      <button onclick={() => (errorMessage = "")} class="text-xs font-bold hover:opacity-70">&times;</button>
    </div>
  {/if}

  <!-- Modern Filter Controls -->
  <div class="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
    <!-- Baris 1: Pencarian & Filter Cepat Jenis -->
    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Search Input dengan Icon -->
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          bind:value={searchKeyword}
          oninput={handleSearchInput}
          placeholder="Cari keterangan, nama anggota, atau pos kas..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
        />
        {#if searchKeyword}
          <button
            onclick={() => { searchKeyword = ''; handleFilterInstant(); }}
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        {/if}
      </div>

      <!-- Segmented Tab Jenis Transaksi (Semua / Masuk / Keluar) -->
      <div class="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-semibold self-start sm:self-auto">
        <button
          onclick={() => selectJenisPill("")}
          class="px-3.5 py-1.5 rounded-lg transition {filterJenis === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
        >
          Semua Jenis
        </button>
        <button
          onclick={() => selectJenisPill("masuk")}
          class="px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition {filterJenis === 'masuk' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'}"
        >
          <span class="text-xs">↓</span> Kas Masuk
        </button>
        <button
          onclick={() => selectJenisPill("keluar")}
          class="px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition {filterJenis === 'keluar' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'}"
        >
          <span class="text-xs">↑</span> Kas Keluar
        </button>
      </div>

      <!-- Rentang Tanggal Cepat -->
      <div class="flex items-center gap-2 text-xs">
        <input
          type="date"
          bind:value={filterDari}
          onchange={handleFilterInstant}
          title="Tanggal Mulai"
          class="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        <span class="text-slate-400">s/d</span>
        <input
          type="date"
          bind:value={filterSampai}
          onchange={handleFilterInstant}
          title="Tanggal Selesai"
          class="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        {#if isAnyFilterActive}
          <button
            onclick={handleResetFilter}
            class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-semibold rounded-xl transition"
            title="Bersihkan Semua Filter"
          >
            Reset
          </button>
        {/if}
      </div>
    </div>

    <!-- Baris 2: PILIHAN KATEGORI INSTAN (LANGSUNG KESARING SAAT DIKLIK) -->
    <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
      <span class="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1.5">Kategori:</span>

      <!-- Pill Semua Kategori -->
      <button
        type="button"
        onclick={() => selectCategoryPill("")}
        class="px-3 py-1 rounded-full text-xs font-semibold transition border {filterCategoryId === '' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}"
      >
        Semua ({categories.length})
      </button>

      <!-- Pill per Kategori (Instant click-filter) -->
      {#each activeCategoryPills as cat}
        <button
          type="button"
          onclick={() => selectCategoryPill(String(cat.id))}
          class="px-3 py-1 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 {String(filterCategoryId) === String(cat.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}"
        >
          <span class="w-1.5 h-1.5 rounded-full {cat.jenis === 'masuk' ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
          <span>{cat.nama}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Modern Table Card -->
  <div class="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600 border-collapse">
        <thead class="bg-slate-50/80 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200/60">
          <tr>
            <th class="py-3.5 px-4 font-bold">Tanggal</th>
            <th class="py-3.5 px-4 font-bold">Jenis</th>
            <th class="py-3.5 px-4 font-bold">Pos Kategori</th>
            <th class="py-3.5 px-4 font-bold">Keterangan</th>
            <th class="py-3.5 px-4 font-bold">Anggota</th>
            <th class="py-3.5 px-4 font-bold text-right">Jumlah (Rp)</th>
            {#if currentUser?.role === "bendahara"}
              <th class="py-3.5 px-4 font-bold text-center">Aksi</th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if isLoading}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 6} class="p-12 text-center text-slate-400">
                <div class="inline-block animate-spin rounded-full h-7 w-7 border-2 border-indigo-600 border-t-transparent"></div>
                <div class="mt-2 text-xs font-medium">Memuat data transaksi...</div>
              </td>
            </tr>
          {:else if transactions.length === 0}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 6} class="p-12 text-center text-slate-400">
                <div class="text-3xl mb-2">🔍</div>
                <div class="font-semibold text-slate-700 text-sm">Tidak ada transaksi yang sesuai</div>
                <div class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau ubah saringan kategori.</div>
                {#if isAnyFilterActive}
                  <button
                    onclick={handleResetFilter}
                    class="mt-3 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition"
                  >
                    Reset Saringan
                  </button>
                {/if}
              </td>
            </tr>
          {:else}
            {#each transactions as tx}
              <tr class="hover:bg-slate-50/80 transition duration-75">
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-700 font-semibold text-xs">
                  {formatTanggal(tx.tanggal)}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  {#if tx.jenis === 'masuk'}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span>↓</span> Masuk
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                      <span>↑</span> Keluar
                    </span>
                  {/if}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                  <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                    {tx.nama_kategori}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="max-w-xs sm:max-w-md truncate text-slate-800 font-normal">
                    {tx.keterangan || "-"}
                  </div>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs font-medium">
                  {#if tx.nama_anggota}
                    <span class="text-slate-700">👤 {tx.nama_anggota}</span>
                  {:else}
                    <span class="text-slate-400">-</span>
                  {/if}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-right font-extrabold text-sm {tx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}">
                  {tx.jenis === 'masuk' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                </td>
                {#if currentUser?.role === "bendahara"}
                  <td class="py-3.5 px-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-1">
                      <a
                        href="/transaksi/{tx.id}/edit"
                        class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Transaksi"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </a>
                      <button
                        onclick={() => handleDelete(tx.id, tx.keterangan)}
                        class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Transaksi"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                {/if}
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Modern Pagination Bar -->
    {#if pagination.total > 0}
      <div class="p-4 bg-slate-50/50 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Menampilkan baris <strong>{((pagination.page - 1) * pagination.limit) + 1}</strong> &mdash; <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> dari total <strong>{pagination.total}</strong> transaksi
        </div>
        <div class="flex items-center gap-1.5">
          <button
            disabled={pagination.page <= 1 || isLoading}
            onclick={() => loadTransactions(pagination.page - 1)}
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
          >
            &larr; Sebelumnya
          </button>
          <span class="px-3 py-1.5 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-xs">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onclick={() => loadTransactions(pagination.page + 1)}
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
          >
            Selanjutnya &rarr;
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
