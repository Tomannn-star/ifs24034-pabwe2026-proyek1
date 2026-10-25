<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { auth } from "$lib/stores/auth.js";
  import { toast } from "$lib/stores/toast.js";
  import { formatRupiah, formatTanggal } from "$lib/utils/format.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Button from "$lib/components/Button.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import {
    Receipt,
    Plus,
    Search,
    ArrowDownLeft,
    ArrowUpRight,
    Pencil,
    Trash2,
    Calendar,
    X,
    Filter,
    RotateCcw
  } from "lucide-svelte";

  let currentUser = $state(null);
  let transactions = $state([]);
  let categories = $state([]);
  let pagination = $state({ page: 1, limit: 10, total: 0, totalPages: 1 });
  let isLoading = $state(true);
  let errorMessage = $state("");

  // Filter state
  let filterJenis = $state("");
  let filterCategoryId = $state("");
  let filterDari = $state("");
  let filterSampai = $state("");
  let searchKeyword = $state("");
  let searchDebounceTimer = null;

  // Modal konfirmasi hapus
  let isDeleteModalOpen = $state(false);
  let transactionToDelete = $state(null);
  let isDeleting = $state(false);

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
      toast.error(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  // Filter instan saat kategori, jenis, atau tanggal berubah
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

  function openDeleteModal(tx) {
    transactionToDelete = tx;
    isDeleteModalOpen = true;
  }

  async function confirmDelete() {
    if (!transactionToDelete) return;
    isDeleting = true;
    try {
      await api.delete(`transactions/${transactionToDelete.id}`);
      toast.success("Catatan transaksi kas berhasil dihapus");
      isDeleteModalOpen = false;
      transactionToDelete = null;
      loadTransactions(pagination.page);
    } catch (err) {
      toast.error(err.message || "Gagal menghapus transaksi");
    } finally {
      isDeleting = false;
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
  <PageHeader
    title="Transaksi Kas Kelas"
    description="Riwayat mutasi arus kas masuk dan kas keluar kas kelas secara transparan."
    icon={Receipt}
  >
    {#if currentUser?.role === "bendahara"}
      <a href="/transaksi/baru">
        <Button variant="primary" size="md">
          <Plus class="w-4 h-4 mr-1.5" />
          <span>Catat Transaksi</span>
        </Button>
      </a>
    {/if}
  </PageHeader>

  <!-- Modern Filter Controls -->
  <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
    <!-- Baris 1: Pencarian & Filter Cepat Jenis -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <!-- Search Input dengan Icon -->
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
          <Search class="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          bind:value={searchKeyword}
          oninput={handleSearchInput}
          placeholder="Cari keterangan, pos kas, atau nama anggota..."
          aria-label="Cari transaksi berdasarkan keterangan atau nama"
          class="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
        />
        {#if searchKeyword}
          <button
            onclick={() => { searchKeyword = ''; handleFilterInstant(); }}
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 cursor-pointer"
            aria-label="Bersihkan pencarian"
          >
            <X class="w-4 h-4" aria-hidden="true" />
          </button>
        {/if}
      </div>

      <!-- Segmented Tab Jenis Transaksi (Semua / Masuk / Keluar) -->
      <div class="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-semibold self-start sm:self-auto shrink-0">
        <button
          onclick={() => selectJenisPill("")}
          class="px-3 py-1.5 rounded-lg transition cursor-pointer {filterJenis === '' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}"
        >
          Semua Jenis
        </button>
        <button
          onclick={() => selectJenisPill("masuk")}
          class="px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer {filterJenis === 'masuk' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-teal-800'}"
        >
          <ArrowDownLeft class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Kas Masuk</span>
        </button>
        <button
          onclick={() => selectJenisPill("keluar")}
          class="px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer {filterJenis === 'keluar' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'}"
        >
          <ArrowUpRight class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Kas Keluar</span>
        </button>
      </div>

      <!-- Rentang Tanggal Cepat -->
      <div class="flex items-center gap-2 text-xs">
        <input
          type="date"
          bind:value={filterDari}
          onchange={handleFilterInstant}
          title="Tanggal Mulai"
          aria-label="Tanggal Mulai"
          class="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-xs"
        />
        <span class="text-slate-600">s/d</span>
        <input
          type="date"
          bind:value={filterSampai}
          onchange={handleFilterInstant}
          title="Tanggal Selesai"
          aria-label="Tanggal Selesai"
          class="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-xs"
        />
        {#if isAnyFilterActive}
          <Button variant="ghost" size="sm" onclick={handleResetFilter} title="Bersihkan filter">
            <RotateCcw class="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span>Reset</span>
          </Button>
        {/if}
      </div>
    </div>

    <!-- Baris 2: PILIHAN KATEGORI INSTAN -->
    <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
      <span class="text-xs font-bold uppercase tracking-wider text-slate-600 mr-1.5">Pos Kategori:</span>

      <button
        type="button"
        onclick={() => selectCategoryPill("")}
        class="px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer {filterCategoryId === '' ? 'bg-teal-700 text-white border-teal-700 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}"
      >
        Semua ({categories.length})
      </button>

      {#each activeCategoryPills as cat}
        <button
          type="button"
          onclick={() => selectCategoryPill(String(cat.id))}
          class="px-3 py-1 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer {String(filterCategoryId) === String(cat.id) ? 'bg-teal-700 text-white border-teal-700 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}"
        >
          <span class="w-1.5 h-1.5 rounded-full {cat.jenis === 'masuk' ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
          <span>{cat.nama}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Modern Table Card -->
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600 border-collapse">
        <thead class="bg-slate-50/80 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200/60">
          <tr>
            <th class="py-3.5 px-4 font-bold">Tanggal</th>
            <th class="py-3.5 px-4 font-bold">Jenis</th>
            <th class="py-3.5 px-4 font-bold">Pos Kategori</th>
            <th class="py-3.5 px-4 font-bold">Keterangan</th>
            <th class="py-3.5 px-4 font-bold">Anggota Terkait</th>
            <th class="py-3.5 px-4 font-bold text-right">Jumlah</th>
            {#if currentUser?.role === "bendahara"}
              <th class="py-3.5 px-4 font-bold text-center">Aksi</th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if isLoading}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 6} class="p-12 text-center text-slate-600">
                <div class="inline-block animate-spin rounded-full h-7 w-7 border-2 border-teal-700 border-t-transparent"></div>
                <div class="mt-2 text-xs font-medium">Memuat data transaksi kas...</div>
              </td>
            </tr>
          {:else if transactions.length === 0}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 6} class="p-12 text-center">
                <EmptyState
                  title="Tidak ada transaksi yang cocok"
                  description="Coba sesuaikan kata kunci pencarian atau bersihkan saringan kategori."
                  icon={Search}
                >
                  {#if isAnyFilterActive}
                    <Button variant="secondary" size="sm" onclick={handleResetFilter}>
                      Bersihkan Saringan
                    </Button>
                  {/if}
                </EmptyState>
              </td>
            </tr>
          {:else}
            {#each transactions as tx}
              <tr class="hover:bg-slate-50/70 transition duration-75">
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-700 font-semibold text-xs">
                  {formatTanggal(tx.tanggal)}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  {#if tx.jenis === 'masuk'}
                    <Badge variant="success" size="sm">
                      <ArrowDownLeft class="w-3.5 h-3.5 mr-1" />
                      <span>Masuk</span>
                    </Badge>
                  {:else}
                    <Badge variant="danger" size="sm">
                      <ArrowUpRight class="w-3.5 h-3.5 mr-1" />
                      <span>Keluar</span>
                    </Badge>
                  {/if}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                  <span class="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                    {tx.nama_kategori}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="max-w-xs sm:max-w-md truncate text-slate-800 font-normal">
                    {tx.keterangan || "-"}
                  </div>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs font-medium">
                  {#if tx.nama_anggota}
                    <span class="font-semibold text-slate-700">{tx.nama_anggota}</span>
                  {:else}
                    <span class="text-slate-600">-</span>
                  {/if}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-right font-extrabold text-sm tabular-nums {tx.jenis === 'masuk' ? 'text-emerald-800' : 'text-rose-700'}">
                  {tx.jenis === 'masuk' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                </td>
                {#if currentUser?.role === "bendahara"}
                  <td class="py-3.5 px-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-1">
                      <a
                        href="/transaksi/{tx.id}/edit"
                        class="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                        title="Edit Transaksi"
                        aria-label="Edit transaksi {tx.keterangan || ''}"
                      >
                        <Pencil class="w-4 h-4" />
                      </a>
                      <button
                        onclick={() => openDeleteModal(tx)}
                        class="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Transaksi"
                        aria-label="Hapus transaksi {tx.keterangan || ''}"
                      >
                        <Trash2 class="w-4 h-4" />
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
      <div class="p-4 bg-slate-50/60 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Menampilkan baris <strong>{((pagination.page - 1) * pagination.limit) + 1}</strong> &mdash; <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> dari total <strong>{pagination.total}</strong> transaksi
        </div>
        <div class="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.page <= 1 || isLoading}
            onclick={() => loadTransactions(pagination.page - 1)}
          >
            &larr; Sebelumnya
          </Button>
          <span class="px-3 py-1.5 font-bold text-slate-800 bg-white border border-slate-200 rounded-xl shadow-2xs">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onclick={() => loadTransactions(pagination.page + 1)}
          >
            Selanjutnya &rarr;
          </Button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Modal Konfirmasi Hapus Transaksi -->
<Modal
  open={isDeleteModalOpen}
  title="Konfirmasi Hapus Transaksi"
  confirmText="Ya, Hapus Transaksi"
  cancelText="Batal"
  confirmVariant="danger"
  loading={isDeleting}
  onclose={() => (isDeleteModalOpen = false)}
  onconfirm={confirmDelete}
>
  {#if transactionToDelete}
    <p class="text-sm text-slate-600">
      Apakah kamu yakin ingin menghapus catatan transaksi:
    </p>
    <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-sm">
      <div class="font-bold text-slate-900">{transactionToDelete.keterangan || transactionToDelete.nama_kategori}</div>
      <div class="text-xs text-slate-500 flex items-center gap-2">
        <span>{formatTanggal(transactionToDelete.tanggal)}</span>
        <span>&bull;</span>
        <span class="font-bold text-slate-700">{formatRupiah(transactionToDelete.jumlah)}</span>
      </div>
    </div>
    <p class="text-xs text-rose-600">
      Tindakan ini permanen dan akan langsung memperbarui saldo kas kelas.
    </p>
  {/if}
</Modal>
