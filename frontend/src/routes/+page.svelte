<script>
  import { onMount, onDestroy } from "svelte";
  import Chart from "chart.js/auto";
  import { api } from "$lib/api.js";
  import { auth } from "$lib/stores/auth.js";
  import { formatRupiah, formatTanggal, formatPeriode } from "$lib/utils/format.js";

  let currentUser = $state(null);
  let summaryData = $state(null);
  let remindersData = $state(null);
  let isLoading = $state(true);
  let errorMessage = $state("");

  let canvasEl = $state(null);
  let chartInstance = null;

  $effect(() => {
    const unsub = auth.subscribe((s) => (currentUser = s.user));
    return unsub;
  });

  onMount(async () => {
    await loadDashboardData();
  });

  onDestroy(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });

  async function loadDashboardData() {
    isLoading = true;
    errorMessage = "";
    try {
      // Ambil summary kas dan pengingat secara paralel
      const [summaryRes, remindersRes] = await Promise.all([
        api.get("summary"),
        api.get("reminders")
      ]);

      summaryData = summaryRes;
      remindersData = remindersRes;

      // Tunggu DOM ter-render untuk inisialisasi grafik Chart.js
      setTimeout(renderChart, 50);
    } catch (err) {
      errorMessage = err.message || "Gagal memuat ringkasan kas";
    } finally {
      isLoading = false;
    }
  }

  function renderChart() {
    if (!canvasEl || !summaryData?.rekap_bulanan) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = summaryData.rekap_bulanan.map((item) => formatPeriode(item.periode));
    const dataMasuk = summaryData.rekap_bulanan.map((item) => item.masuk);
    const dataKeluar = summaryData.rekap_bulanan.map((item) => item.keluar);

    chartInstance = new Chart(canvasEl, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Pemasukan",
            data: dataMasuk,
            backgroundColor: "rgba(16, 185, 129, 0.8)", // Emerald-500
            borderColor: "rgb(16, 185, 129)",
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: "Pengeluaran",
            data: dataKeluar,
            backgroundColor: "rgba(244, 63, 94, 0.8)", // Rose-500
            borderColor: "rgb(244, 63, 94)",
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              font: {
                family: "system-ui, sans-serif",
                weight: 600
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const val = formatRupiah(context.raw);
                return ` ${label}: ${val}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => formatRupiah(val)
            },
            grid: {
              color: "rgba(226, 232, 240, 0.6)"
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
</script>

<svelte:head>
  <title>Dashboard - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Judul Halaman -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Kas Kelas</h1>
      <p class="text-slate-500 text-sm">
        Selamat datang di <strong>KasPintar</strong>, {currentUser?.nama || currentUser?.username}.
      </p>
    </div>
    {#if currentUser?.role === "bendahara"}
      <div class="flex items-center gap-2">
        <a
          href="/transaksi/baru"
          class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <span>➕</span> Catat Transaksi
        </a>
      </div>
    {/if}
  </div>

  {#if errorMessage}
    <div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between">
      <span>{errorMessage}</span>
      <button onclick={loadDashboardData} class="text-xs font-semibold underline hover:no-underline">Coba lagi</button>
    </div>
  {/if}

  {#if isLoading}
    <div class="p-12 text-center text-slate-400 space-y-3">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      <p class="text-sm">Memuat data dashboard KasPintar...</p>
    </div>
  {:else}
    <!-- ============================================================= -->
    <!-- 1. BANNER PENGINGAT (REMINDERS) -->
    <!-- ============================================================= -->
    {#if currentUser?.role === "anggota" && remindersData}
      {#if remindersData.jumlah_belum_bayar === 0}
        <!-- HIJAU: Semua Lunas -->
        <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm">
          <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl shrink-0">
            ✅
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-sm text-emerald-900">Semua iuran sudah lunas</h3>
            <p class="text-xs text-emerald-700 mt-0.5">
              Hebat! Kamu tidak memiliki tagihan uang kas yang tertunggak. Terima kasih sudah membayar tepat waktu.
            </p>
          </div>
        </div>
      {:else if remindersData.ada_terlambat}
        <!-- MERAH: Ada Tunggakan Terlambat -->
        <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-xl shrink-0">
              ⚠️
            </div>
            <div>
              <h3 class="font-bold text-sm text-rose-900">
                Kamu punya {remindersData.jumlah_belum_bayar} iuran belum dibayar, total {formatRupiah(remindersData.total_tunggakan)}
              </h3>
              <p class="text-xs text-rose-700 mt-0.5">
                Terdapat <strong>{remindersData.jumlah_terlambat} iuran telah melewati tanggal jatuh tempo</strong>. Mohon segera melakukan pembayaran kepada bendahara kelas.
              </p>
            </div>
          </div>
          <a
            href="/iuran"
            class="hidden sm:inline-flex px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-xl shadow-sm transition shrink-0"
          >
            Lihat Tagihan
          </a>
        </div>
      {:else}
        <!-- KUNING: Belum Terlambat -->
        <div class="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl shrink-0">
              ⏰
            </div>
            <div>
              <h3 class="font-bold text-sm text-amber-900">
                Kamu punya {remindersData.jumlah_belum_bayar} iuran belum dibayar, total {formatRupiah(remindersData.total_tunggakan)}
              </h3>
              <p class="text-xs text-amber-700 mt-0.5">
                Jatuh tempo terdekat: {formatTanggal(remindersData.iuran[0]?.jatuh_tempo)} (Sisa {remindersData.iuran[0]?.sisa_hari} hari lagi).
              </p>
            </div>
          </div>
          <a
            href="/iuran"
            class="hidden sm:inline-flex px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-xl shadow-sm transition shrink-0"
          >
            Lihat Iuran
          </a>
        </div>
      {/if}
    {/if}

    <!-- Banner Ringkasan Penunggak untuk Bendahara -->
    {#if currentUser?.role === "bendahara" && summaryData?.total_penunggak > 0}
      <div class="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl shrink-0">
            📢
          </div>
          <div>
            <h3 class="font-bold text-sm text-amber-900">
              Terdapat {summaryData.total_penunggak} anggota yang menunggak iuran kas
            </h3>
            <p class="text-xs text-amber-700 mt-0.5">
              Tagihan telah melewati batas jatuh tempo. Kamu dapat memeriksa rincian anggota penunggak di menu penunggak.
            </p>
          </div>
        </div>
        <a
          href="/penunggak"
          class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-xl shadow-sm transition shrink-0"
        >
          Lihat Penunggak
        </a>
      </div>
    {/if}

    <!-- ============================================================= -->
    <!-- 2. KARTU SALDO, PEMASUKAN, PENGELUARAN -->
    <!-- ============================================================= -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Saldo Kas Utama -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo Kas Kelas</span>
          <span class="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-lg">💳</span>
        </div>
        <div class="mt-3">
          <div class="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
            {formatRupiah(summaryData?.saldo || 0)}
          </div>
          <p class="text-xs text-slate-500 mt-1">Dihitung otomatis dari selisih transaksi</p>
        </div>
      </div>

      <!-- Total Pemasukan -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Pemasukan</span>
          <span class="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-lg">📈</span>
        </div>
        <div class="mt-3">
          <div class="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {formatRupiah(summaryData?.total_masuk || 0)}
          </div>
          <p class="text-xs text-slate-500 mt-1">Total iuran & sumbangan masuk</p>
        </div>
      </div>

      <!-- Total Pengeluaran -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Pengeluaran</span>
          <span class="p-2 bg-rose-50 text-rose-600 rounded-xl text-lg">📉</span>
        </div>
        <div class="mt-3">
          <div class="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {formatRupiah(summaryData?.total_keluar || 0)}
          </div>
          <p class="text-xs text-slate-500 mt-1">Belanja ATK, konsumsi & kegiatan</p>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- 3. GRAFIK KEUANGAN BULANAN (CHART.JS) -->
    <!-- ============================================================= -->
    <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-bold text-slate-900 text-lg">Arus Kas Bulanan</h2>
          <p class="text-xs text-slate-500">Perbandingan pemasukan dan pengeluaran tiap bulan</p>
        </div>
      </div>
      <div class="h-64 sm:h-72 w-full">
        <canvas bind:this={canvasEl}></canvas>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- 4. LIMA TRANSAKSI TERAKHIR -->
    <!-- ============================================================= -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="font-bold text-slate-900 text-base">5 Transaksi Terakhir</h2>
          <p class="text-xs text-slate-500">Aktivitas keuangan terbaru yang tercatat</p>
        </div>
        <a href="/transaksi" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
          Lihat Semua Transaksi &rarr;
        </a>
      </div>

      {#if !summaryData?.transaksi_terakhir || summaryData.transaksi_terakhir.length === 0}
        <div class="p-8 text-center text-slate-400 text-sm">Belum ada transaksi tercatat</div>
      {:else}
        <div class="divide-y divide-slate-100">
          {#each summaryData.transaksi_terakhir as tx}
            <div class="p-4 flex items-center justify-between hover:bg-slate-50 transition">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base {tx.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                  {tx.jenis === 'masuk' ? '↓' : '↑'}
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-800 line-clamp-1">
                    {tx.keterangan || tx.nama_kategori}
                  </div>
                  <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatTanggal(tx.tanggal)}</span>
                    <span>&bull;</span>
                    <span class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 text-[10px] font-medium">{tx.nama_kategori}</span>
                    {#if tx.nama_anggota}
                      <span>&bull;</span>
                      <span class="text-slate-500 text-[11px]">{tx.nama_anggota}</span>
                    {/if}
                  </div>
                </div>
              </div>

              <div class="text-right font-bold text-sm {tx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'} shrink-0 ml-4">
                {tx.jenis === 'masuk' ? '+' : '-'} {formatRupiah(tx.jumlah)}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
