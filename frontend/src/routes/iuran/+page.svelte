<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { auth } from "$lib/stores/auth.js";
  import { formatRupiah, formatTanggal, formatPeriode } from "$lib/utils/format.js";

  let currentUser = $state(null);
  let dues = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state("");
  let successMessage = $state("");

  // Filter bendahara
  let selectedPeriode = $state("");
  let filterStatus = $state("");

  // Modal Generate Tagihan (Bendahara)
  let isGenerateModalOpen = $state(false);
  let genPeriode = $state("2026-11");
  let genNominal = $state(20000);
  let genJatuhTempo = $state("2026-11-10");
  let isGenerating = $state(false);

  $effect(() => {
    const unsub = auth.subscribe((s) => (currentUser = s.user));
    return unsub;
  });

  onMount(async () => {
    // Ambil default periode bulan ini jika ada
    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = String(now.getMonth() + 1).padStart(2, "0");
    selectedPeriode = `${currYear}-${currMonth}`;

    loadDues();
  });

  async function loadDues() {
    isLoading = true;
    errorMessage = "";
    try {
      const params = new URLSearchParams();
      if (selectedPeriode) params.set("periode", selectedPeriode);
      if (filterStatus) params.set("status", filterStatus);

      const res = await api.get(`dues?${params.toString()}`);
      dues = res.data || [];
    } catch (err) {
      errorMessage = err.message || "Gagal memuat data iuran";
    } finally {
      isLoading = false;
    }
  }

  function handleFilterChange() {
    loadDues();
  }

  function handleShowAllPeriode() {
    selectedPeriode = "";
    loadDues();
  }

  async function handleMarkPaid(due) {
    const confirmPay = window.confirm(
      `Tandai lunas iuran periode ${due.periode} untuk "${due.nama_anggota}" sebesar ${formatRupiah(due.nominal)}?\nTransaksi kas pemasukan akan dibuat otomatis.`
    );
    if (!confirmPay) return;

    try {
      await api.post(`dues/${due.id}/pay`, {});
      successMessage = `Iuran "${due.nama_anggota}" berhasil ditandai lunas dan transaksi kas telah tercatat.`;
      setTimeout(() => (successMessage = ""), 4000);
      loadDues();
    } catch (err) {
      errorMessage = err.message || "Gagal menandai lunas iuran";
    }
  }

  async function handleGenerateSubmit(e) {
    e.preventDefault();
    isGenerating = true;
    errorMessage = "";
    try {
      const res = await api.post("dues/generate", {
        periode: genPeriode,
        nominal: Number(genNominal),
        jatuh_tempo: genJatuhTempo
      });

      successMessage = `Berhasil membuat ${res.generated} tagihan baru untuk periode ${res.periode} (${res.skipped} anggota sudah memiliki tagihan).`;
      isGenerateModalOpen = false;
      selectedPeriode = genPeriode;
      loadDues();
      setTimeout(() => (successMessage = ""), 5000);
    } catch (err) {
      errorMessage = err.message || "Gagal membuat tagihan iuran";
    } finally {
      isGenerating = false;
    }
  }
</script>

<svelte:head>
  <title>Iuran Kas - KasPintar</title>
</svelte:head>

<div class="space-y-5">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
        {currentUser?.role === 'bendahara' ? 'Kelola Iuran Kas Kelas' : 'Riwayat Iuran Kas Saya'}
      </h1>
      <p class="text-slate-500 text-sm">
        {currentUser?.role === 'bendahara' ? 'Pantau status pembayaran iuran seluruh anggota per periode.' : 'Catatan pembayaran dan pengingat tagihan iuran kas milikmu.'}
      </p>
    </div>
    {#if currentUser?.role === "bendahara"}
      <button
        onclick={() => (isGenerateModalOpen = true)}
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
      >
        <span>⚡</span> Buat Tagihan Periode Baru
      </button>
    {/if}
  </div>

  {#if successMessage}
    <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
      ✅ {successMessage}
    </div>
  {/if}

  {#if errorMessage}
    <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center justify-between">
      <span>⚠️ {errorMessage}</span>
      <button onclick={() => (errorMessage = "")} class="text-xs font-bold">&times;</button>
    </div>
  {/if}

  <!-- Panel Filter Periode -->
  <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
    <div class="flex items-center gap-2 w-full sm:w-auto">
      <label for="periode" class="text-xs font-bold text-slate-600 uppercase shrink-0">Periode:</label>
      <input
        id="periode"
        type="month"
        bind:value={selectedPeriode}
        onchange={handleFilterChange}
        class="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
      />
      {#if selectedPeriode}
        <button
          onclick={handleShowAllPeriode}
          class="text-xs text-indigo-600 hover:underline font-semibold shrink-0"
        >
          Lihat Semua Periode
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <label for="status" class="text-xs font-bold text-slate-600 uppercase shrink-0">Status:</label>
      <select
        id="status"
        bind:value={filterStatus}
        onchange={handleFilterChange}
        class="w-full sm:w-40 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Semua Status</option>
        <option value="belum">Belum Lunas</option>
        <option value="lunas">Lunas</option>
      </select>
    </div>
  </div>

  <!-- Tabel Iuran -->
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
          <tr>
            <th class="py-3.5 px-4">Periode</th>
            {#if currentUser?.role === "bendahara"}
              <th class="py-3.5 px-4">Anggota</th>
            {/if}
            <th class="py-3.5 px-4">Nominal</th>
            <th class="py-3.5 px-4">Jatuh Tempo</th>
            <th class="py-3.5 px-4">Status & Keterangan</th>
            <th class="py-3.5 px-4">Tanggal Bayar</th>
            {#if currentUser?.role === "bendahara"}
              <th class="py-3.5 px-4 text-center">Aksi Pelunasan</th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if isLoading}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 5} class="p-8 text-center text-slate-400">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                <div class="mt-2 text-xs">Memuat data iuran...</div>
              </td>
            </tr>
          {:else if dues.length === 0}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 5} class="p-8 text-center text-slate-400">
                Tidak ada data tagihan iuran pada periode ini
              </td>
            </tr>
          {:else}
            {#each dues as due}
              <tr class="hover:bg-slate-50/70 transition">
                <td class="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                  {formatPeriode(due.periode)}
                </td>
                {#if currentUser?.role === "bendahara"}
                  <td class="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                    {due.nama_anggota || "-"}
                  </td>
                {/if}
                <td class="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800">
                  {formatRupiah(due.nominal)}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                  {formatTanggal(due.jatuh_tempo)}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  {#if due.status === "lunas"}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span>✓ Lunas</span>
                    </span>
                  {:else if due.terlambat}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <span>⚠️ Terlambat ({due.hari_terlambat} hari)</span>
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <span>Belum Bayar (Sisa {due.sisa_hari} hari)</span>
                    </span>
                  {/if}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                  {due.tanggal_bayar ? formatTanggal(due.tanggal_bayar) : "-"}
                </td>
                {#if currentUser?.role === "bendahara"}
                  <td class="py-3.5 px-4 whitespace-nowrap text-center">
                    {#if due.status === "belum"}
                      <button
                        onclick={() => handleMarkPaid(due)}
                        class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                      >
                        Tandai Lunas
                      </button>
                    {:else}
                      <span class="text-xs text-slate-400 font-medium">Selesai</span>
                    {/if}
                  </td>
                {/if}
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Modal Generate Tagihan (Bendahara) -->
{#if isGenerateModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
    <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 class="font-bold text-lg text-slate-900">Buat Tagihan Iuran Massal</h3>
        <button onclick={() => (isGenerateModalOpen = false)} class="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
      </div>

      <p class="text-xs text-slate-500">
        Tagihan iuran akan dibuatkan secara otomatis untuk <strong>semua anggota kelas yang berstatus aktif</strong>. Anggota yang sudah memiliki tagihan di periode yang sama tidak akan diduplikasi.
      </p>

      <form onsubmit={handleGenerateSubmit} class="space-y-4">
        <div>
          <label for="genPeriode" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Periode Tagihan (Bulan & Tahun)
          </label>
          <input
            id="genPeriode"
            type="month"
            bind:value={genPeriode}
            required
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="genNominal" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Nominal Iuran (Rupiah)
          </label>
          <input
            id="genNominal"
            type="number"
            bind:value={genNominal}
            min="1000"
            step="1000"
            required
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
          />
        </div>

        <div>
          <label for="genJatuhTempo" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Batas Tanggal Jatuh Tempo
          </label>
          <input
            id="genJatuhTempo"
            type="date"
            bind:value={genJatuhTempo}
            required
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onclick={() => (isGenerateModalOpen = false)}
            class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {#if isGenerating}
              <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Memproses...</span>
            {:else}
              <span>Generate Tagihan</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

