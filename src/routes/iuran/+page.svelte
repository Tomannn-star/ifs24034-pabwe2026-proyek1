<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth.js";
  import { duesService } from "$lib/services/duesService.js";
  import { toast } from "$lib/stores/toast.js";
  import { formatRupiah, formatTanggal, formatPeriode } from "$lib/utils/format.js";
  import { validateNominal, validateTanggal } from "$lib/utils/validators.js";
  import { extractErrorMessage } from "$lib/utils/errorHandler.js";
  import { USER_ROLES, BADGE_VARIANTS, MODAL_VARIANTS, DUES_STATUS } from "$lib/constants/index.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Button from "$lib/components/Button.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Input from "$lib/components/Input.svelte";
  import Select from "$lib/components/Select.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import {
    CalendarClock,
    Plus,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw
  } from "lucide-svelte";

  let currentUser = $state(null);
  let dues = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state("");

  // Filter state
  let selectedPeriode = $state("");
  let filterStatus = $state("");

  // Modal Generate Tagihan (Bendahara)
  let isGenerateModalOpen = $state(false);
  let genPeriode = $state("");
  let genNominal = $state("20000");
  let genJatuhTempo = $state("");
  let isGenerating = $state(false);

  // Modal Pelunasan (Bendahara)
  let isPayModalOpen = $state(false);
  let dueToPay = $state(null);
  let isPaying = $state(false);

  onMount(() => {
    const unsub = auth.subscribe((val) => {
      currentUser = val.user;
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    selectedPeriode = `${year}-${month}`;
    genPeriode = `${year}-${month}`;
    genJatuhTempo = `${year}-${month}-15`;

    loadDues();
    return unsub;
  });

  async function loadDues() {
    isLoading = true;
    errorMessage = "";
    try {
      const filter = {};
      if (selectedPeriode) filter.periode = selectedPeriode;
      if (filterStatus) filter.status = filterStatus;

      const res = await duesService.getDues(filter);
      dues = res.data || [];
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Gagal memuat data iuran");
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
      await duesService.payDues(dueToPay.id);
      toast.success(`Pembayaran iuran ${dueToPay.nama_anggota || "anggota"} berhasil dicatat`);
      isPayModalOpen = false;
      dueToPay = null;
      loadDues();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal memproses pelunasan iuran"));
    } finally {
      isPaying = false;
    }
  }

  async function handleGenerateSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (!genPeriode) {
      toast.error("Periode tagihan wajib diisi");
      return;
    }

    const nominalErr = validateNominal(genNominal, 1000);
    if (nominalErr) {
      toast.error(nominalErr);
      return;
    }

    const jatuhTempoErr = validateTanggal(genJatuhTempo);
    if (jatuhTempoErr) {
      toast.error(jatuhTempoErr);
      return;
    }

    isGenerating = true;
    try {
      const res = await duesService.generateMonthlyDues({
        periode: genPeriode,
        nominal: parseInt(genNominal, 10),
        jatuh_tempo: genJatuhTempo
      });

      toast.success(
        res.message || `Berhasil membuat tagihan iuran untuk periode ${genPeriode}`
      );
      isGenerateModalOpen = false;
      selectedPeriode = genPeriode;
      loadDues();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal membuat tagihan iuran massal"));
    } finally {
      isGenerating = false;
    }
  }
</script>

<svelte:head>
  <title>Iuran Kas Kelas - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <PageHeader
    title="Iuran Kas Kelas"
    description="Pantau status iuran bulanan wajib setiap anggota kelas dan pencatatan pelunasan."
    icon={CalendarClock}
  >
    {#if currentUser?.role === USER_ROLES.BENDAHARA}
      <Button variant="primary" size="md" onclick={() => (isGenerateModalOpen = true)}>
        <Plus class="w-4 h-4 mr-1.5" />
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
        <option value="belum">{DUES_STATUS.BELUM_BAYAR === 'belum_bayar' ? 'Belum Lunas' : 'Belum'}</option>
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
            {#if currentUser?.role === USER_ROLES.BENDAHARA}
              <th class="py-3.5 px-4 font-bold">Anggota</th>
            {/if}
            <th class="py-3.5 px-4 font-bold">Nominal</th>
            <th class="py-3.5 px-4 font-bold">Jatuh Tempo</th>
            <th class="py-3.5 px-4 font-bold">Status</th>
            <th class="py-3.5 px-4 font-bold">Tanggal Bayar</th>
            {#if currentUser?.role === USER_ROLES.BENDAHARA}
              <th class="py-3.5 px-4 font-bold text-center">Aksi Pelunasan</th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if isLoading}
            <tr>
              <td colspan={currentUser?.role === USER_ROLES.BENDAHARA ? 7 : 5} class="p-12 text-center text-slate-600">
                <div class="inline-block animate-spin rounded-full h-7 w-7 border-2 border-teal-700 border-t-transparent"></div>
                <div class="mt-2 text-xs font-medium">Memuat data iuran...</div>
              </td>
            </tr>
          {:else if dues.length === 0}
            <tr>
              <td colspan={currentUser?.role === USER_ROLES.BENDAHARA ? 7 : 5} class="p-12 text-center">
                <EmptyState
                  title="Tidak ada tagihan iuran pada periode ini"
                  description={currentUser?.role === USER_ROLES.BENDAHARA ? "Klik tombol 'Buat Tagihan Periode' untuk membuat tagihan iuran massal bagi anggota kelas aktif." : "Kamu belum memiliki tagihan iuran pada filter periode yang dipilih."}
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
                {#if currentUser?.role === USER_ROLES.BENDAHARA}
                  <td class="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {due.nama_anggota || "-"}
                  </td>
                {/if}
                <td class="py-3.5 px-4 font-bold text-teal-800 tabular-nums whitespace-nowrap">
                  {formatRupiah(due.nominal)}
                </td>
                <td class="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {formatTanggal(due.jatuh_tempo)}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  {#if due.status === "lunas"}
                    <Badge variant={BADGE_VARIANTS.SUCCESS} size="sm">
                      <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
                      <span>Lunas</span>
                    </Badge>
                  {:else if due.status === "menunggak"}
                    <Badge variant={BADGE_VARIANTS.DANGER} size="sm">
                      <XCircle class="w-3.5 h-3.5 mr-1" />
                      <span>Menunggak</span>
                    </Badge>
                  {:else}
                    <Badge variant={BADGE_VARIANTS.AMBER} size="sm">
                      <AlertCircle class="w-3.5 h-3.5 mr-1" />
                      <span>Belum Bayar</span>
                    </Badge>
                  {/if}
                </td>
                <td class="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {due.tanggal_bayar ? formatTanggal(due.tanggal_bayar) : "-"}
                </td>
                {#if currentUser?.role === USER_ROLES.BENDAHARA}
                  <td class="py-3.5 px-4 text-center whitespace-nowrap">
                    {#if due.status !== "lunas"}
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
  confirmLabel="Ya, Tandai Lunas"
  cancelLabel="Batal"
  variant={MODAL_VARIANTS.PRIMARY}
  loading={isPaying}
  onclose={() => (isPayModalOpen = false)}
  onconfirm={confirmPay}
>
  {#if dueToPay}
    <div class="space-y-3">
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
    </div>
  {/if}
</Modal>

<!-- Modal Generate Tagihan Massal -->
<Modal
  open={isGenerateModalOpen}
  title="Buat Tagihan Iuran Massal"
  confirmLabel="Generate Tagihan"
  cancelLabel="Batal"
  variant={MODAL_VARIANTS.PRIMARY}
  loading={isGenerating}
  onclose={() => (isGenerateModalOpen = false)}
  onconfirm={handleGenerateSubmit}
>
  <form id="genForm" onsubmit={handleGenerateSubmit} class="space-y-4">
    <p class="text-xs text-slate-500">
      Tagihan akan dibuat otomatis untuk <strong>seluruh anggota kelas berstatus aktif</strong>. Anggota yang sudah memiliki tagihan pada periode ini tidak akan diduplikasi.
    </p>

    <Input
      id="genPeriode"
      name="genPeriode"
      type="month"
      label="Periode Tagihan"
      bind:value={genPeriode}
      required
    />

    <Input
      id="genNominal"
      name="genNominal"
      type="number"
      label="Nominal Iuran (Rupiah)"
      bind:value={genNominal}
      prefix="Rp"
      min="1000"
      step="1000"
      required
    />

    <Input
      id="genJatuhTempo"
      name="genJatuhTempo"
      type="date"
      label="Batas Jatuh Tempo"
      bind:value={genJatuhTempo}
      required
    />
  </form>
</Modal>
