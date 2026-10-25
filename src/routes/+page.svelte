<script>
  import { onMount, onDestroy } from "svelte";
  import Chart from "chart.js/auto";
  import { api } from "$lib/api.js";
  import { auth } from "$lib/stores/auth.js";
  import { formatRupiah, formatTanggal, formatPeriode } from "$lib/utils/format.js";
  import Card from "$lib/components/Card.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Button from "$lib/components/Button.svelte";
  import {
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    CalendarClock,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Receipt,
    Plus,
    ChevronRight,
    AlertCircle,
    Bell
  } from "lucide-svelte";

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

      setTimeout(renderChart, 80);
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
            backgroundColor: "#0f766e", // Primary Teal-700
            hoverBackgroundColor: "#115e59",
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: "Kas Keluar",
            data: dataKeluar,
            backgroundColor: "#f43f5e", // Rose-500
            hoverBackgroundColor: "#e11d48",
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        animation: false,
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
                family: "Plus Jakarta Sans Variable, sans-serif",
                size: 12,
                weight: 600
              }
            }
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            padding: 12,
            cornerRadius: 12,
            titleFont: {
              family: "Plus Jakarta Sans Variable, sans-serif",
              size: 13,
              weight: 700
            },
            bodyFont: {
              family: "Plus Jakarta Sans Variable, sans-serif",
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
                family: "Plus Jakarta Sans Variable, sans-serif",
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
                family: "Plus Jakarta Sans Variable, sans-serif",
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
  <!-- ============================================================= -->
  <!-- PAGE HEADER & SAPAAN                                          -->
  <!-- ============================================================= -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Ringkasan Kas Kelas</h1>
      </div>
      <p class="text-slate-500 text-sm mt-0.5">
        Halo, <strong class="text-slate-800 font-semibold">{currentUser?.nama || currentUser?.username}</strong>. Selamat datang kembali di sistem KasPintar.
      </p>
    </div>
    {#if currentUser?.role === "bendahara"}
      <div class="flex items-center gap-2">
        <a href="/transaksi/baru">
          <Button variant="primary" size="md">
            <Plus class="w-4 h-4 mr-1.5" />
            <span>Catat Transaksi</span>
          </Button>
        </a>
      </div>
    {/if}
  </div>

  {#if errorMessage}
    <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-center justify-between shadow-2xs">
      <div class="flex items-center gap-2.5">
        <AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
        <span class="font-medium">{errorMessage}</span>
      </div>
      <button onclick={loadDashboardData} class="text-xs font-bold underline hover:no-underline">Coba lagi</button>
    </div>
  {/if}

  {#if isLoading}
    <div class="p-16 text-center text-slate-600 space-y-3">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-700 border-t-transparent"></div>
      <p class="text-sm font-medium">Memuat data ikhtisar kas kelas...</p>
    </div>
  {:else}
    <!-- ============================================================= -->
    <!-- 1. BANNER PENGINGAT (REMINDERS) MODERN                        -->
    <!-- ============================================================= -->
    {#if currentUser?.role === "anggota" && remindersData}
      {#if remindersData.jumlah_belum_bayar === 0}
        <!-- HIJAU: Semua Lunas -->
        <div class="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/20 text-emerald-950 rounded-2xl flex items-center gap-4 shadow-2xs">
          <div class="w-11 h-11 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 class="w-6 h-6" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-bold text-base text-emerald-950">Semua iuran kas sudah lunas</h2>
            <p class="text-xs text-emerald-700 mt-0.5">
              Luar biasa! Kamu tidak memiliki tunggakan iuran saat ini. Terima kasih telah tertib berkontribusi untuk kas kelas!
            </p>
          </div>
        </div>
      {:else if remindersData.ada_terlambat}
        <!-- MERAH: Ada Tunggakan Terlambat -->
        <div class="p-5 bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-orange-500/10 border border-rose-500/30 text-rose-950 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-11 h-11 bg-rose-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <AlertTriangle class="w-6 h-6" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <h2 class="font-bold text-base text-rose-950">
                Kamu punya {remindersData.jumlah_belum_bayar} iuran belum dibayar &mdash; total <span class="tabular-nums font-extrabold">{formatRupiah(remindersData.total_tunggakan)}</span>
              </h2>
              <p class="text-xs text-rose-700 mt-0.5">
                Peringatan: <strong>{remindersData.jumlah_terlambat} tagihan telah melewati tanggal jatuh tempo</strong>. Harap segera melunasi iuran kepada bendahara kelas.
              </p>
            </div>
          </div>
          <a href="/iuran" class="shrink-0">
            <Button variant="danger" size="sm">
              <span>Lihat Iuran Saya</span>
              <ChevronRight class="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </a>
        </div>
      {:else}
        <!-- AMBER: Belum Terlambat -->
        <div class="p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-yellow-500/10 border border-amber-500/30 text-amber-950 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-11 h-11 bg-amber-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <Clock class="w-6 h-6" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <h2 class="font-bold text-base text-amber-950">
                Kamu punya {remindersData.jumlah_belum_bayar} iuran belum dibayar &mdash; total <span class="tabular-nums font-extrabold">{formatRupiah(remindersData.total_tunggakan)}</span>
              </h2>
              <p class="text-xs text-amber-800 mt-0.5">
                Jatuh tempo: <strong>{formatTanggal(remindersData.iuran[0]?.jatuh_tempo)}</strong> (Sisa waktu: <strong>{remindersData.iuran[0]?.sisa_hari} hari lagi</strong>).
              </p>
            </div>
          </div>
          <a href="/iuran" class="shrink-0">
            <Button variant="secondary" size="sm">
              <span>Lihat Iuran Saya</span>
              <ChevronRight class="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </a>
        </div>
      {/if}
    {/if}

    <!-- Banner Ringkasan Penunggak untuk Bendahara -->
    {#if currentUser?.role === "bendahara" && summaryData?.total_penunggak > 0}
      <div class="p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-rose-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div class="flex items-center gap-4 min-w-0">
          <div class="w-11 h-11 bg-amber-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Bell class="w-6 h-6" aria-hidden="true" />
          </div>
          <div class="min-w-0">
            <h2 class="font-bold text-base text-amber-950">
              Perhatian: {summaryData.total_penunggak} anggota kelas tercatat menunggak iuran kas
            </h2>
            <p class="text-xs text-amber-800 mt-0.5">
              Tagihan mereka telah melewati batas tanggal jatuh tempo. Pantau atau hubungi anggota terkait.
            </p>
          </div>
        </div>
        <a href="/penunggak" class="shrink-0">
          <Button variant="secondary" size="sm">
            <span>Daftar Penunggak</span>
            <ChevronRight class="w-4 h-4 ml-1" aria-hidden="true" />
          </Button>
        </a>
      </div>
    {/if}

    <!-- ============================================================= -->
    <!-- 2. STATS CARDS: SALDO BESAR, MASUK, KELUAR                    -->
    <!-- ============================================================= -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Saldo Kas Card Besar -->
      <div class="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 text-white p-6 rounded-2xl border border-teal-800 shadow-sm relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-teal-200">Saldo Kas Kelas</span>
          <div class="w-10 h-10 rounded-xl bg-white/10 text-teal-200 flex items-center justify-center border border-white/15 shadow-inner">
            <Wallet class="w-5 h-5 text-teal-200" />
          </div>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-extrabold tracking-tight tabular-nums text-white">
            {formatRupiah(summaryData?.saldo || 0)}
          </div>
          <div class="flex items-center gap-1.5 mt-2 text-xs text-teal-200/80">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Kas aktif siap digunakan</span>
          </div>
        </div>
      </div>

      <!-- Total Pemasukan Card -->
      <StatCard
        title="Total Pemasukan"
        value={formatRupiah(summaryData?.total_masuk || 0)}
        subtitle="Iuran anggota & donasi masuk"
        trend="Iuran tertib"
        trendType="up"
        icon={ArrowDownLeft}
      />

      <!-- Total Pengeluaran Card -->
      <StatCard
        title="Total Pengeluaran"
        value={formatRupiah(summaryData?.total_keluar || 0)}
        subtitle="Belanja ATK, konsumsi & kegiatan"
        trend="Operasional"
        trendType="down"
        icon={ArrowUpRight}
      />
    </div>

    <!-- ============================================================= -->
    <!-- 3. GRAFIK KEUANGAN BULANAN (CHART.JS)                         -->
    <!-- ============================================================= -->
    <Card>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 class="font-extrabold text-slate-900 text-lg">Arus Kas Bulanan</h2>
          <p class="text-xs text-slate-500 mt-0.5">Grafik perbandingan pemasukan dan pengeluaran per periode</p>
        </div>
        <div class="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60 self-start sm:self-auto">
          Diperbarui Real-Time
        </div>
      </div>
      <div class="h-64 sm:h-72 w-full">
        <canvas bind:this={canvasEl}></canvas>
      </div>
    </Card>

    <!-- ============================================================= -->
    <!-- 4. LIMA TRANSAKSI TERAKHIR                                   -->
    <!-- ============================================================= -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="font-extrabold text-slate-900 text-base">5 Transaksi Terakhir</h2>
          <p class="text-xs text-slate-500 mt-0.5">Catatan mutasi kas paling baru</p>
        </div>
        <a href="/transaksi" class="text-xs font-bold text-teal-700 hover:text-teal-900 transition flex items-center gap-1">
          <span>Buka Semua Transaksi</span>
          <ChevronRight class="w-3.5 h-3.5" />
        </a>
      </div>

      {#if !summaryData?.transaksi_terakhir || summaryData.transaksi_terakhir.length === 0}
        <div class="p-10 text-center text-slate-600 text-sm">Belum ada transaksi tercatat</div>
      {:else}
        <div class="divide-y divide-slate-100">
          {#each summaryData.transaksi_terakhir as tx}
            <div class="p-4 flex items-center justify-between hover:bg-slate-50/70 transition duration-75">
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 {tx.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-rose-50 text-rose-800 border border-rose-200/60'}">
                  {#if tx.jenis === 'masuk'}
                    <ArrowDownLeft class="w-5 h-5" aria-hidden="true" />
                  {:else}
                    <ArrowUpRight class="w-5 h-5" aria-hidden="true" />
                  {/if}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-bold text-slate-800 truncate">
                    {tx.keterangan || tx.nama_kategori}
                  </div>
                  <div class="text-xs text-slate-600 flex flex-wrap items-center gap-2 mt-0.5">
                    <span class="font-medium text-slate-700">{formatTanggal(tx.tanggal)}</span>
                    <span>&bull;</span>
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">{tx.nama_kategori}</span>
                    {#if tx.nama_anggota}
                      <span>&bull;</span>
                      <span class="text-slate-700 text-[11px] font-medium">{tx.nama_anggota}</span>
                    {/if}
                  </div>
                </div>
              </div>

              <div class="text-right font-extrabold text-sm tabular-nums {tx.jenis === 'masuk' ? 'text-emerald-800' : 'text-rose-700'} shrink-0 ml-4">
                {tx.jenis === 'masuk' ? '+' : '-'} {formatRupiah(tx.jumlah)}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
