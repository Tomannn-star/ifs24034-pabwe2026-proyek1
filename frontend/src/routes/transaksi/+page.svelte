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

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadTransactions(1);
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
</script>

<svelte:head>
  <title>Daftar Transaksi - KasPintar</title>
</svelte:head>

<div class="space-y-5">
  <!-- Header & Tombol Tambah -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Daftar Transaksi Kas</h1>
      <p class="text-slate-500 text-sm">Riwayat seluruh arus kas masuk dan kas keluar kelas.</p>
    </div>
    {#if currentUser?.role === "bendahara"}
      <a
        href="/transaksi/baru"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
      >
        <span>➕</span> Catat Transaksi Baru
      </a>
    {/if}
  </div>

  {#if successMessage}
    <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between">
      <span>✅ {successMessage}</span>
    </div>
  {/if}

  {#if errorMessage}
    <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center justify-between">
      <span>⚠️ {errorMessage}</span>
      <button onclick={() => (errorMessage = "")} class="text-xs font-bold">&times;</button>
    </div>
  {/if}

  <!-- Panel Filter & Pencarian -->
  <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
    <form onsubmit={handleFilterSubmit} class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- Cari Teks -->
      <div class="lg:col-span-2">
        <label for="search" class="block text-xs font-semibold text-slate-600 mb-1">Cari Keterangan / Anggota</label>
        <input
          id="search"
          type="text"
          bind:value={searchKeyword}
          placeholder="Cari keterangan, nama kategori..."
          class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Filter Jenis -->
      <div>
        <label for="jenis" class="block text-xs font-semibold text-slate-600 mb-1">Jenis Transaksi</label>
        <select
          id="jenis"
          bind:value={filterJenis}
          class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Jenis</option>
          <option value="masuk">Masuk (Pemasukan)</option>
          <option value="keluar">Keluar (Pengeluaran)</option>
        </select>
      </div>

      <!-- Filter Kategori -->
      <div>
        <label for="kategori" class="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
        <select
          id="kategori"
          bind:value={filterCategoryId}
          class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Kategori</option>
          {#each categories as cat}
            <option value={cat.id}>{cat.nama} ({cat.jenis})</option>
          {/each}
        </select>
      </div>

      <!-- Tombol Aksi Filter -->
      <div class="flex items-end gap-2">
        <button
          type="submit"
          class="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition"
        >
          Saring
        </button>
        <button
          type="button"
          onclick={handleResetFilter}
          class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
          title="Reset Saringan"
        >
          Reset
        </button>
      </div>
    </form>
  </div>

  <!-- Tabel Data Transaksi -->
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
          <tr>
            <th class="py-3.5 px-4">Tanggal</th>
            <th class="py-3.5 px-4">Jenis</th>
            <th class="py-3.5 px-4">Kategori</th>
            <th class="py-3.5 px-4">Keterangan</th>
            <th class="py-3.5 px-4">Anggota</th>
            <th class="py-3.5 px-4 text-right">Jumlah</th>
            {#if currentUser?.role === "bendahara"}
              <th class="py-3.5 px-4 text-center">Aksi</th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if isLoading}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 6} class="p-8 text-center text-slate-400">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                <div class="mt-2 text-xs">Memuat data transaksi...</div>
              </td>
            </tr>
          {:else if transactions.length === 0}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 6} class="p-8 text-center text-slate-400">
                Tidak ada data transaksi yang sesuai dengan saringan
              </td>
            </tr>
          {:else}
            {#each transactions as tx}
              <tr class="hover:bg-slate-50/70 transition">
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium text-xs">
                  {formatTanggal(tx.tanggal)}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold {tx.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                    {tx.jenis === 'masuk' ? 'Masuk' : 'Keluar'}
                  </span>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                  {tx.nama_kategori}
                </td>
                <td class="py-3.5 px-4">
                  <div class="max-w-xs sm:max-w-md truncate text-slate-700">
                    {tx.keterangan || "-"}
                  </div>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                  {tx.nama_anggota || "-"}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-right font-bold {tx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}">
                  {tx.jenis === 'masuk' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                </td>
                {#if currentUser?.role === "bendahara"}
                  <td class="py-3.5 px-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-1.5">
                      <a
                        href="/transaksi/{tx.id}/edit"
                        class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Transaksi"
                      >
                        ✏️
                      </a>
                      <button
                        onclick={() => handleDelete(tx.id, tx.keterangan)}
                        class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Transaksi"
                      >
                        🗑️
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

    <!-- Pagination Footer -->
    {#if pagination.total > 0}
      <div class="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Menampilkan halaman <strong>{pagination.page}</strong> dari <strong>{pagination.totalPages}</strong> ({pagination.total} total transaksi)
        </div>
        <div class="flex items-center gap-2">
          <button
            disabled={pagination.page <= 1 || isLoading}
            onclick={() => loadTransactions(pagination.page - 1)}
            class="px-3 py-1.5 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            &larr; Sebelumnya
          </button>
          <button
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onclick={() => loadTransactions(pagination.page + 1)}
            class="px-3 py-1.5 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Selanjutnya &rarr;
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
