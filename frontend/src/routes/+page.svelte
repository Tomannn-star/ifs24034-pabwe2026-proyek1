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
      const [summaryRes, remindersRes] = await Promise.all([
        api.get("summary"),
        api.get("reminders")
      ]);

      summaryData = summaryRes;
      remindersData = remindersRes;

      setTimeout(renderChart, 60);
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
            label: "Kas Masuk",
            data: dataMasuk,
            backgroundColor: "rgba(16, 185, 129, 0.85)", // Emerald-500
            hoverBackgroundColor: "rgba(16, 185, 129, 1)",
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: "Kas Keluar",
            data: dataKeluar,
            backgroundColor: "rgba(244, 63, 94, 0.85)", // Rose-500
            hoverBackgroundColor: "rgba(244, 63, 94, 1)",
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              boxWidth: 8,
              font: {
                family: "Plus Jakarta Sans, sans-serif",
                size: 12,
                weight: 600
              }
            }
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            padding: 12,
            cornerRadius: 12,
            titleFont: {
              family: "Plus Jakarta Sans, sans-serif",
              size: 13,
              weight: 700
            },
            bodyFont: {
              family: "Plus Jakarta Sans, sans-serif",
              size: 12
            },
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const val = formatRupiah(context.raw);
                return `  ${label}: ${val}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => formatRupiah(val),
              font: {
                family: "Plus Jakarta Sans, sans-serif",
                size: 11
              },
              color: "#64748b"
            },
            grid: {
              color: "rgba(241, 245, 249, 1)"
            },
            border: {
              dash: [4, 4]
            }
          },
          x: {
            ticks: {
              font: {
                family: "Plus Jakarta Sans, sans-serif",
                size: 12,
                weight: 600
              },
              color: "#334155"
            },
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
  <!-- Header Page & Quick Action -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Ringkasan Kas</h1>
      </div>
      <p class="text-slate-500 text-sm mt-0.5">
        Halo, <strong class="text-slate-700">{currentUser?.nama || currentUser?.username}</strong>. Selamat datang di sistem kas kelas KasPintar.
      </p>
    </div>
    {#if currentUser?.role === "bendahara"}
      <div class="flex items-center gap-2">
        <a
          href="/transaksi/baru"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition"
        >
          <span class="text-base">＋</span> Catat Transaksi
        </a>
      </div>
    {/if}
  </div>

  {#if errorMessage}
    <div class="p-4 bg-rose-50 border border-rose-200/80 text-rose-800 rounded-2xl text-sm flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-2">
        <span>⚠️</span>
        <span class="font-medium">{errorMessage}</span>
      </div>
      <button onclick={loadDashboardData} class="text-xs font-bold underline hover:no-underline">Coba lagi</button>
    </div>
  {/if}

  {#if isLoading}
    <div class="p-16 text-center text-slate-400 space-y-3">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
      <p class="text-sm font-medium">Memuat ikhtisar kas kelas...</p>
    </div>
  {:else}
    <!-- ============================================================= -->
    <!-- 1. BANNER PENGINGAT (REMINDERS) MODERN -->
    <!-- ============================================================= -->
    {#if currentUser?.role === "anggota" && remindersData}
      {#if remindersData.jumlah_belum_bayar === 0}
        <!-- HIJAU: Semua Lunas -->
        <div class="p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/20 text-emerald-950 rounded-2xl flex items-center gap-4 shadow-xs">
          <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
            ✓
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-base text-emerald-950">Semua iuran sudah lunas</h3>
            <p class="text-xs text-emerald-700/90 mt-0.5">
              Luar biasa! Kamu tidak memiliki tunggakan iuran uang kas saat ini. Terima kasih telah tertib berkontribusi untuk kas kelas!
            </p>
          </div>
        </div>
      {:else if remindersData.ada_terlambat}
        <!-- MERAH: Ada Tunggakan Terlambat -->
        <div class="p-5 bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-orange-500/10 border border-rose-500/30 text-rose-950 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm animate-pulse">
              !
            </div>
            <div>
              <h3 class="font-extrabold text-base text-rose-950">
                Kamu punya {remindersData.jumlah_belum_bayar} iuran belum dibayar, total {formatRupiah(remindersData.total_tunggakan)}
              </h3>
              <p class="text-xs text-rose-700/90 mt-0.5">
                Peringatan: <strong>{remindersData.jumlah_terlambat} tagihan telah melewati tanggal jatuh tempo</strong>. Harap segera melunasi iuran kepada bendahara kelas.
              </p>
            </div>
          </div>
          <a
            href="/iuran"
            class="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition text-center shrink-0"
          >
            Bayar / Lihat Rincian
          </a>
        </div>
      {:else}
        <!-- KUNING: Belum Terlambat -->
        <div class="p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-yellow-500/10 border border-amber-500/30 text-amber-950 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
              ⏰
            </div>
            <div>
              <h3 class="font-extrabold text-base text-amber-950">
                Kamu punya {remindersData.jumlah_belum_bayar} iuran belum dibayar, total {formatRupiah(remindersData.total_tunggakan)}
              </h3>
              <p class="text-xs text-amber-800/90 mt-0.5">
                Jatuh tempo pembayaran: <strong>{formatTanggal(remindersData.iuran[0]?.jatuh_tempo)}</strong> (Sisa waktu: <strong>{remindersData.iuran[0]?.sisa_hari} hari lagi</strong>).
              </p>
            </div>
          </div>
          <a
            href="/iuran"
            class="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition text-center shrink-0"
          >
            Lihat Iuran Saya
          </a>
        </div>
      {/if}
    {/if}

    <!-- Banner Ringkasan Penunggak untuk Bendahara -->
    {#if currentUser?.role === "bendahara" && summaryData?.total_penunggak > 0}
      <div class="p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-rose-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
            📢
          </div>
          <div>
            <h3 class="font-extrabold text-base text-amber-950">
              Perhatian: {summaryData.total_penunggak} anggota tercatat menunggak iuran kas
            </h3>
            <p class="text-xs text-amber-800 mt-0.5">
              Iuran mereka telah melewati batas tanggal jatuh tempo. Pantau atau ingatkan mereka melalui halaman penunggak.
            </p>
          </div>
        </div>
        <a
          href="/penunggak"
          class="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition text-center shrink-0"
        >
          Buka Daftar Penunggak
        </a>
      </div>
    {/if}

    <!-- ============================================================= -->
    <!-- 2. STATS CARDS: SALDO, MASUK, KELUAR -->
    <!-- ============================================================= -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Saldo Kas Card -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:border-indigo-300 transition duration-150">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo Kas Kelas</span>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold">
            💳
          </div>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-extrabold text-indigo-600 tracking-tight">
            {formatRupiah(summaryData?.saldo || 0)}
          </div>
          <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span class="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Kas aktif siap digunakan</span>
          </div>
        </div>
      </div>

      <!-- Total Pemasukan Card -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:border-emerald-300 transition duration-150">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pemasukan</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
            📈
          </div>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-extrabold text-emerald-600 tracking-tight">
            {formatRupiah(summaryData?.total_masuk || 0)}
          </div>
          <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Iuran anggota & donasi masuk</span>
          </div>
        </div>
      </div>

      <!-- Total Pengeluaran Card -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:border-rose-300 transition duration-150">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pengeluaran</span>
          <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold">
            📉
          </div>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-extrabold text-rose-600 tracking-tight">
            {formatRupiah(summaryData?.total_keluar || 0)}
          </div>
          <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span class="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Belanja ATK, konsumsi & kegiatan</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- 3. GRAFIK KEUANGAN BULANAN (CHART.JS) -->
    <!-- ============================================================= -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 class="font-extrabold text-slate-900 text-lg">Arus Kas Bulanan</h2>
          <p class="text-xs text-slate-500 mt-0.5">Grafik visual komparasi pemasukan dan pengeluaran per periode</p>
        </div>
        <div class="text-xs font-medium text-slate-400">
          Diperbarui secara real-time
        </div>
      </div>
      <div class="h-64 sm:h-72 w-full">
        <canvas bind:this={canvasEl}></canvas>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- 4. LIMA TRANSAKSI TERAKHIR -->
    <!-- ============================================================= -->
    <div class="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="font-extrabold text-slate-900 text-base">5 Transaksi Terakhir</h2>
          <p class="text-xs text-slate-500 mt-0.5">Aktivitas keuangan paling baru yang tercatat</p>
        </div>
        <a href="/transaksi" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
          Buka Semua Transaksi &rarr;
        </a>
      </div>

      {#if !summaryData?.transaksi_terakhir || summaryData.transaksi_terakhir.length === 0}
        <div class="p-10 text-center text-slate-400 text-sm">Belum ada transaksi tercatat</div>
      {:else}
        <div class="divide-y divide-slate-100">
          {#each summaryData.transaksi_terakhir as tx}
            <div class="p-4 flex items-center justify-between hover:bg-slate-50/80 transition duration-75">
              <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base font-bold {tx.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                  {tx.jenis === 'masuk' ? '↓' : '↑'}
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-800 line-clamp-1">
                    {tx.keterangan || tx.nama_kategori}
                  </div>
                  <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span class="font-medium text-slate-500">{formatTanggal(tx.tanggal)}</span>
                    <span>&bull;</span>
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-semibold">{tx.nama_kategori}</span>
                    {#if tx.nama_anggota}
                      <span>&bull;</span>
                      <span class="text-slate-500 text-[11px]">👤 {tx.nama_anggota}</span>
                    {/if}
                  </div>
                </div>
              </div>

              <div class="text-right font-extrabold text-sm {tx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'} shrink-0 ml-4">
                {tx.jenis === 'masuk' ? '+' : '-'} {formatRupiah(tx.jumlah)}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
