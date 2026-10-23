<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { formatRupiah, formatPeriode, formatTanggal } from "$lib/utils/format.js";

  let overdueData = $state(null);
  let isLoading = $state(true);
  let errorMessage = $state("");

  onMount(async () => {
    loadOverdueData();
  });

  async function loadOverdueData() {
    isLoading = true;
    errorMessage = "";
    try {
      const res = await api.get("reminders/overdue");
      overdueData = res;
    } catch (err) {
      errorMessage = err.message || "Gagal memuat daftar penunggak";
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Daftar Penunggak Iuran - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Daftar Penunggak Iuran Kas</h1>
      <p class="text-slate-500 text-sm">
        Daftar anggota kelas yang memiliki tagihan iuran melewati tanggal jatuh tempo.
      </p>
    </div>
    <button
      onclick={loadOverdueData}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
    >
      <span>🔄</span> Segarkan Data
    </button>
  </div>

  {#if errorMessage}
    <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center justify-between">
      <span>⚠️ {errorMessage}</span>
      <button onclick={loadOverdueData} class="text-xs font-semibold underline">Coba lagi</button>
    </div>
  {/if}

  {#if isLoading}
    <div class="p-12 text-center text-slate-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      <p class="mt-2 text-sm">Menganalisis keterlambatan iuran anggota...</p>
    </div>
  {:else if overdueData}
    <!-- Ringkasan Statistik Penunggak -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-rose-700">Total Anggota Menunggak</span>
          <span class="text-xl">👥</span>
        </div>
        <div class="text-3xl font-extrabold text-rose-600 mt-2">
          {overdueData.total_anggota_menunggak} <span class="text-sm font-medium text-rose-700">Orang</span>
        </div>
        <p class="text-xs text-rose-600 mt-1">Anggota dengan minimal 1 tagihan lewat jatuh tempo</p>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-700">Total Tunggakan Tertahan</span>
          <span class="text-xl">💸</span>
        </div>
        <div class="text-3xl font-extrabold text-amber-600 mt-2">
          {formatRupiah(overdueData.grand_total_tunggakan)}
        </div>
        <p class="text-xs text-amber-700 mt-1">Akumulasi seluruh tagihan yang belum dibayar</p>
      </div>
    </div>

    <!-- Tabel Rincian Anggota Penunggak -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-slate-900 text-base">Rincian Anggota & Periode Menunggak</h2>
        <span class="text-xs text-slate-500 font-medium">Diurutkan dari tunggakan terbesar</span>
      </div>

      {#if overdueData.penunggak.length === 0}
        <div class="p-12 text-center text-slate-400">
          <div class="text-3xl mb-2">🎉</div>
          <div class="font-bold text-slate-700">Luar biasa! Tidak ada anggota yang menunggak.</div>
          <div class="text-xs text-slate-500 mt-1">Semua anggota kelas telah melunasi iuran yang jatuh tempo.</div>
        </div>
      {:else}
        <div class="divide-y divide-slate-100">
          {#each overdueData.penunggak as p, idx}
            <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
              <div class="space-y-1.5 flex-1">
                <div class="flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span class="font-bold text-slate-900 text-base">{p.nama}</span>
                  {#if p.kontak}
                    <a
                      href="https://wa.me/{p.kontak.replace(/^0/, '62')}"
                      target="_blank"
                      rel="noreferrer"
                      class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 transition"
                      title="Kirim pengingat WhatsApp"
                    >
                      <span>💬 {p.kontak}</span>
                    </a>
                  {/if}
                </div>

                <!-- Rincian Periode yang Menunggak -->
                <div class="flex flex-wrap items-center gap-1.5 pt-1">
                  <span class="text-xs text-slate-500">Periode terlambat:</span>
                  {#each p.rincian as r}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-semibold">
                      <span>{formatPeriode(r.periode)}</span>
                      <span class="text-[10px] text-rose-500">({r.hari_terlambat} hr)</span>
                    </span>
                  {/each}
                </div>
              </div>

              <!-- Total Tunggakan Anggota & Aksi -->
              <div class="flex items-center justify-between md:justify-end gap-4 shrink-0">
                <div class="text-right">
                  <div class="text-xs font-semibold text-slate-400">Total Tunggakan ({p.jumlah_tunggakan} bulan)</div>
                  <div class="text-lg font-extrabold text-rose-600">{formatRupiah(p.total_tunggakan)}</div>
                </div>

                <a
                  href="/iuran"
                  class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition"
                >
                  Kelola Iuran &rarr;
                </a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
