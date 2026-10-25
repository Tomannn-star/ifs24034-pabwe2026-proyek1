<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { toast } from "$lib/stores/toast.js";
  import { formatRupiah, formatPeriode, formatTanggal } from "$lib/utils/format.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import Button from "$lib/components/Button.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import {
    AlertTriangle,
    RotateCcw,
    Users,
    CircleDollarSign,
    MessageCircle,
    ChevronRight,
    CheckCircle2
  } from "lucide-svelte";

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
      toast.error(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  function getWhatsAppUrl(p) {
    if (!p.kontak) return null;
    const phone = p.kontak.replace(/[^0-9]/g, "").replace(/^0/, "62");
    const text = encodeURIComponent(
      `Halo ${p.nama}, mengingatkan iuran uang kas kelas sebesar ${formatRupiah(p.total_tunggakan)} yang telah melewati jatuh tempo. Mohon segera melunasi kepada bendahara ya. Terima kasih!`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }
</script>

<svelte:head>
  <title>Daftar Penunggak Iuran - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <PageHeader
    title="Daftar Penunggak Iuran Kas"
    description="Daftar anggota kelas yang memiliki tagihan iuran melewati tanggal jatuh tempo."
    icon={AlertTriangle}
  >
    <Button variant="secondary" size="sm" onclick={loadOverdueData}>
      <RotateCcw class="w-3.5 h-3.5 mr-1.5" />
      <span>Segarkan Data</span>
    </Button>
  </PageHeader>

  {#if isLoading}
    <div class="p-16 text-center text-slate-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-700 border-t-transparent"></div>
      <p class="mt-2 text-sm font-medium">Menganalisis keterlambatan iuran anggota...</p>
    </div>
  {:else if overdueData}
    <!-- Ringkasan Statistik Penunggak -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div class="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 text-rose-950 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-rose-700">Total Anggota Menunggak</span>
          <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Users class="w-5 h-5 text-rose-700" />
          </div>
        </div>
        <div class="text-3xl font-extrabold text-rose-600 mt-3 tabular-nums">
          {overdueData.total_anggota_menunggak} <span class="text-sm font-semibold text-rose-700">Orang</span>
        </div>
        <p class="text-xs text-rose-600/90 mt-1">Anggota dengan minimal 1 tagihan lewat tanggal jatuh tempo</p>
      </div>

      <div class="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-amber-950 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-700">Total Tunggakan Tertahan</span>
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <CircleDollarSign class="w-5 h-5 text-amber-700" />
          </div>
        </div>
        <div class="text-3xl font-extrabold text-amber-600 mt-3 tabular-nums">
          {formatRupiah(overdueData.grand_total_tunggakan)}
        </div>
        <p class="text-xs text-amber-700/90 mt-1">Akumulasi uang kas yang belum diterima kas kelas</p>
      </div>
    </div>

    <!-- Tabel Rincian Anggota Penunggak -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="font-bold text-slate-900 text-base">Rincian Anggota & Periode Menunggak</h2>
          <p class="text-xs text-slate-500 mt-0.5">Diurutkan otomatis dari akumulasi tunggakan terbesar</p>
        </div>
      </div>

      {#if overdueData.penunggak.length === 0}
        <div class="p-12 text-center">
          <EmptyState
            title="Luar biasa! Tidak ada anggota yang menunggak"
            description="Semua anggota kelas telah tertib melunasi tagihan iuran kas yang telah jatuh tempo."
            icon={CheckCircle2}
          />
        </div>
      {:else}
        <div class="divide-y divide-slate-100">
          {#each overdueData.penunggak as p, idx}
            <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
              <div class="space-y-2 flex-1 min-w-0">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <span class="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span class="font-bold text-slate-900 text-base">{p.nama}</span>
                  
                  {#if p.kontak}
                    <a
                      href={getWhatsAppUrl(p)}
                      target="_blank"
                      rel="noreferrer"
                      class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg hover:bg-emerald-100 transition"
                      title="Kirim pengingat ramah via WhatsApp"
                    >
                      <MessageCircle class="w-3.5 h-3.5" />
                      <span>Ingatkan WA</span>
                    </a>
                  {/if}
                </div>

                <!-- Rincian Periode yang Menunggak -->
                <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span class="text-xs text-slate-600 font-medium">Periode tertunggak:</span>
                  {#each p.rincian as r}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-md text-xs font-bold">
                      <span>{formatPeriode(r.periode)}</span>
                      <span class="text-[10px] text-rose-600 font-normal">({r.hari_terlambat} hari lewat)</span>
                    </span>
                  {/each}
                </div>
              </div>

              <!-- Total Tunggakan Anggota & Aksi -->
              <div class="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div class="text-left md:text-right">
                  <div class="text-xs font-semibold text-slate-600">Total ({p.jumlah_tunggakan} bulan)</div>
                  <div class="text-lg font-extrabold text-rose-600 tabular-nums">{formatRupiah(p.total_tunggakan)}</div>
                </div>

                <a href="/iuran">
                  <Button variant="secondary" size="sm">
                    <span>Kelola Iuran</span>
                    <ChevronRight class="w-3.5 h-3.5 ml-1" />
                  </Button>
                </a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
