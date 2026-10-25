<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { auth } from "$lib/stores/auth.js";
  import { toast } from "$lib/stores/toast.js";
  import { formatRupiah, formatTanggal, formatPeriode } from "$lib/utils/format.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Card from "$lib/components/Card.svelte";
  import Button from "$lib/components/Button.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import {
    CalendarClock,
    Zap,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Filter,
    Calendar,
    RotateCcw
  } from "lucide-svelte";

  let currentUser = $state(null);
  let dues = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state("");

  // Filter bendahara
  let selectedPeriode = $state("");
  let filterStatus = $state("");

  // Modal Generate Tagihan (Bendahara)
  let isGenerateModalOpen = $state(false);
  let genPeriode = $state("2026-11");
  let genNominal = $state(20000);
  let genJatuhTempo = $state("2026-11-10");
  let isGenerating = $state(false);

  // Modal Pelunasan (Bendahara)
  let isPayModalOpen = $state(false);
  let dueToPay = $state(null);
  let isPaying = $state(false);

  $effect(() => {
    const unsub = auth.subscribe((s) => (currentUser = s.user));
    return unsub;
  });

  onMount(async () => {
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
      toast.error(errorMessage);
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

  function openPayModal(due) {
    dueToPay = due;
    isPayModalOpen = true;
  }

  async function confirmPay() {
    if (!dueToPay) return;
    isPaying = true;
    try {
      await api.post(`dues/${dueToPay.id}/pay`, {});
      toast.success(`Iuran "${dueToPay.nama_anggota}" periode ${dueToPay.periode} berhasil dilunasi & kas tercatat.`);
      isPayModalOpen = false;
      dueToPay = null;
      loadDues();
    } catch (err) {
      toast.error(err.message || "Gagal menandai lunas iuran");
    } finally {
      isPaying = false;
    }
  }

  async function handleGenerateSubmit(e) {
    e.preventDefault();
    isGenerating = true;
    try {
      const res = await api.post("dues/generate", {
        periode: genPeriode,
        nominal: Number(genNominal),
        jatuh_tempo: genJatuhTempo
      });

      toast.success(`Berhasil membuat ${res.generated} tagihan baru untuk periode ${res.periode}`);
      isGenerateModalOpen = false;
      selectedPeriode = genPeriode;
      loadDues();
    } catch (err) {
      toast.error(err.message || "Gagal membuat tagihan iuran");
    } finally {
      isGenerating = false;
    }
  }
</script>

<svelte:head>
  <title>Iuran Kas - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <PageHeader
    title={currentUser?.role === 'bendahara' ? 'Kelola Iuran Kas Kelas' : 'Riwayat Iuran Kas Saya'}
    description={currentUser?.role === 'bendahara' ? 'Pantau status pembayaran iuran seluruh anggota per periode.' : 'Catatan pembayaran dan pengingat tagihan iuran kas kelas milikmu.'}
    icon={CalendarClock}
  >
    {#if currentUser?.role === "bendahara"}
      <Button variant="primary" size="md" onclick={() => (isGenerateModalOpen = true)}>
        <Zap class="w-4 h-4 mr-1.5" />
        <span>Buat Tagihan Periode</span>
      </Button>
    {/if}
  </PageHeader>

  <!-- Panel Filter Periode -->
  <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
    <div class="flex flex-wrap items-center gap-2.5">
      <label for="periode" class="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
        Periode:
      </label>
      <input
        id="periode"
        type="month"
        bind:value={selectedPeriode}
        onchange={handleFilterChange}
        class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
      />
      {#if selectedPeriode}
        <Button variant="ghost" size="sm" onclick={handleShowAllPeriode}>
          <RotateCcw class="w-3.5 h-3.5 mr-1" />
          <span>Semua Periode</span>
        </Button>
      {/if}
    </div>

    <div class="flex items-center gap-2.5">
      <label for="status" class="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
        Status:
      </label>
      <select
        id="status"
        bind:value={filterStatus}
        onchange={handleFilterChange}
        class="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition min-w-[140px]"
      >
        <option value="">Semua Status</option>
        <option value="belum">Belum Lunas</option>
        <option value="lunas">Sudah Lunas</option>
      </select>
    </div>
  </div>

  <!-- Tabel Iuran -->
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600 border-collapse">
        <thead class="bg-slate-50/80 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200/60">
          <tr>
            <th class="py-3.5 px-4 font-bold">Periode</th>
            {#if currentUser?.role === "bendahara"}
              <th class="py-3.5 px-4 font-bold">Anggota</th>
            {/if}
            <th class="py-3.5 px-4 font-bold">Nominal</th>
            <th class="py-3.5 px-4 font-bold">Jatuh Tempo</th>
            <th class="py-3.5 px-4 font-bold">Status</th>
            <th class="py-3.5 px-4 font-bold">Tanggal Bayar</th>
            {#if currentUser?.role === "bendahara"}
              <th class="py-3.5 px-4 font-bold text-center">Aksi Pelunasan</th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if isLoading}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 5} class="p-12 text-center text-slate-600">
                <div class="inline-block animate-spin rounded-full h-7 w-7 border-2 border-teal-700 border-t-transparent"></div>
                <div class="mt-2 text-xs font-medium">Memuat data iuran...</div>
              </td>
            </tr>
          {:else if dues.length === 0}
            <tr>
              <td colspan={currentUser?.role === 'bendahara' ? 7 : 5} class="p-12 text-center">
                <EmptyState
                  title="Tidak ada tagihan iuran pada periode ini"
                  description={currentUser?.role === 'bendahara' ? "Klik tombol 'Buat Tagihan Periode' untuk membuat tagihan iuran massal bagi anggota kelas aktif." : "Kamu belum memiliki tagihan iuran pada filter periode yang dipilih."}
                  icon={CalendarClock}
                />
              </td>
            </tr>
          {:else}
            {#each dues as due}
              <tr class="hover:bg-slate-50/70 transition duration-75">
                <td class="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                  {formatPeriode(due.periode)}
                </td>
                {#if currentUser?.role === "bendahara"}
                  <td class="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                    {due.nama_anggota || "-"}
                  </td>
                {/if}
                <td class="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800 tabular-nums">
                  {formatRupiah(due.nominal)}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                  {formatTanggal(due.jatuh_tempo)}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  {#if due.status === "lunas"}
                    <Badge variant="success" size="sm">
                      <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
                      <span>Lunas</span>
                    </Badge>
                  {:else if due.terlambat}
                    <Badge variant="danger" size="sm">
                      <AlertTriangle class="w-3.5 h-3.5 mr-1" />
                      <span>Terlambat ({due.hari_terlambat} hr)</span>
                    </Badge>
                  {:else}
                    <Badge variant="amber" size="sm">
                      <Clock class="w-3.5 h-3.5 mr-1" />
                      <span>Belum Bayar (Sisa {due.sisa_hari} hr)</span>
                    </Badge>
                  {/if}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                  {due.tanggal_bayar ? formatTanggal(due.tanggal_bayar) : "-"}
                </td>
                {#if currentUser?.role === "bendahara"}
                  <td class="py-3.5 px-4 whitespace-nowrap text-center">
                    {#if due.status === "belum"}
                      <Button
                        variant="primary"
                        size="sm"
                        onclick={() => openPayModal(due)}
                      >
                        <span>Tandai Lunas</span>
                      </Button>
                    {:else}
                      <span class="text-xs text-slate-600 font-semibold">Tercatat</span>
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

<!-- Modal Pelunasan Iuran -->
<Modal
  open={isPayModalOpen}
  title="Konfirmasi Pelunasan Iuran"
  confirmText="Ya, Tandai Lunas"
  cancelText="Batal"
  confirmVariant="primary"
  loading={isPaying}
  onclose={() => (isPayModalOpen = false)}
  onconfirm={confirmPay}
>
  {#if dueToPay}
    <p class="text-sm text-slate-600">
      Tandai lunas iuran untuk anggota:
    </p>
    <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-sm">
      <div class="font-bold text-slate-900">{dueToPay.nama_anggota}</div>
      <div class="text-xs text-slate-500 flex items-center justify-between">
        <span>Periode: <strong>{formatPeriode(dueToPay.periode)}</strong></span>
        <span class="font-bold text-teal-800 text-sm tabular-nums">{formatRupiah(dueToPay.nominal)}</span>
      </div>
    </div>
    <p class="text-xs text-slate-500">
      Sistem akan otomatis mencatat mutasi <strong>Kas Masuk</strong> ke dalam pembukuan kas kelas secara real-time.
    </p>
  {/if}
</Modal>

<!-- Modal Generate Tagihan Massal -->
<Modal
  open={isGenerateModalOpen}
  title="Buat Tagihan Iuran Massal"
  confirmText="Generate Tagihan"
  cancelText="Batal"
  confirmVariant="primary"
  loading={isGenerating}
  onclose={() => (isGenerateModalOpen = false)}
  onconfirm={handleGenerateSubmit}
>
  <form id="genForm" onsubmit={handleGenerateSubmit} class="space-y-4">
    <p class="text-xs text-slate-500">
      Tagihan akan dibuat otomatis untuk <strong>seluruh anggota kelas berstatus aktif</strong>. Anggota yang sudah memiliki tagihan pada periode ini tidak akan diduplikasi.
    </p>

    <div class="space-y-1.5">
      <label for="genPeriode" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Periode Tagihan
      </label>
      <input
        id="genPeriode"
        type="month"
        bind:value={genPeriode}
        required
        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
      />
    </div>

    <div class="space-y-1.5">
      <label for="genNominal" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Nominal Iuran (Rupiah)
      </label>
      <div class="relative">
        <span class="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">Rp</span>
        <input
          id="genNominal"
          type="number"
          bind:value={genNominal}
          min="1000"
          step="1000"
          required
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label for="genJatuhTempo" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Batas Jatuh Tempo
      </label>
      <input
        id="genJatuhTempo"
        type="date"
        bind:value={genJatuhTempo}
        required
        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
      />
    </div>
  </form>
</Modal>
