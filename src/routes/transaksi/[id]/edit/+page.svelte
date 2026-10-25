<script>
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { transactionService } from "$lib/services/transactionService.js";
  import { categoryService } from "$lib/services/categoryService.js";
  import { memberService } from "$lib/services/memberService.js";
  import { validateNominal, validateTanggal, validateKeterangan } from "$lib/utils/validators.js";
  import { extractErrorMessage } from "$lib/utils/errorHandler.js";
  import { goto } from "$app/navigation";
  import { toast } from "$lib/stores/toast.js";
  import { ROUTES, TRANSACTION_TYPES } from "$lib/constants/index.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Card from "$lib/components/Card.svelte";
  import Button from "$lib/components/Button.svelte";
  import Input from "$lib/components/Input.svelte";
  import Select from "$lib/components/Select.svelte";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import {
    Pencil,
    ArrowLeft,
    ArrowDownLeft,
    ArrowUpRight
  } from "lucide-svelte";

  const txId = page.params.id;

  let tanggal = $state("");
  let jenis = $state(TRANSACTION_TYPES.MASUK);
  let jumlah = $state("");
  let category_id = $state("");
  let member_id = $state("");
  let keterangan = $state("");

  let allCategories = $state([]);
  let members = $state([]);
  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let errorMessage = $state("");

  let filteredCategories = $derived(
    allCategories.filter((cat) => cat.jenis === jenis)
  );

  onMount(async () => {
    try {
      const [txRes, catsRes, membersRes] = await Promise.all([
        transactionService.getTransactionById(txId),
        categoryService.getCategories(),
        memberService.getMembers()
      ]);

      allCategories = catsRes.data || [];
      members = membersRes.data || [];

      const tx = txRes.data;
      if (tx) {
        tanggal = tx.tanggal;
        jenis = tx.jenis;
        jumlah = String(tx.jumlah);
        category_id = String(tx.category_id);
        member_id = tx.member_id ? String(tx.member_id) : "";
        keterangan = tx.keterangan || "";
      }
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Gagal memuat detail transaksi");
      toast.error(errorMessage);
    } finally {
      isLoading = false;
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    errorMessage = "";

    const tanggalErr = validateTanggal(tanggal);
    if (tanggalErr) {
      errorMessage = tanggalErr;
      toast.error(errorMessage);
      return;
    }

    const nominalErr = validateNominal(jumlah, 1);
    if (nominalErr) {
      errorMessage = nominalErr;
      toast.error(errorMessage);
      return;
    }

    if (!category_id) {
      errorMessage = "Kategori transaksi wajib dipilih";
      toast.error(errorMessage);
      return;
    }

    const ketErr = validateKeterangan(keterangan, 3);
    if (ketErr) {
      errorMessage = ketErr;
      toast.error(errorMessage);
      return;
    }

    isSubmitting = true;
    try {
      await transactionService.updateTransaction(txId, {
        tanggal,
        jenis,
        jumlah: parseInt(jumlah, 10),
        kategori_id: parseInt(category_id, 10),
        member_id: member_id ? parseInt(member_id, 10) : null,
        keterangan: keterangan.trim()
      });

      toast.success("Catatan transaksi berhasil diperbarui");
      goto(ROUTES.TRANSAKSI);
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Gagal memperbarui transaksi");
      toast.error(errorMessage);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Transaksi Kas - KasPintar</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
  <PageHeader
    title="Edit Transaksi Kas"
    description="Perbarui informasi catatan mutasi kas masuk atau keluar."
    icon={Pencil}
  >
    <a href={ROUTES.TRANSAKSI}>
      <Button variant="secondary" size="sm">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        <span>Kembali</span>
      </Button>
    </a>
  </PageHeader>

  {#if isLoading}
    <Card>
      <div class="p-6 space-y-4">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-24 w-full" />
      </div>
    </Card>
  {:else}
    <Card>
      <form onsubmit={handleSubmit} class="space-y-5">
        <!-- Jenis Transaksi (Masuk / Keluar) -->
        <div>
          <span class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Jenis Transaksi
          </span>
          <div class="grid grid-cols-2 gap-3">
            <label
              class="flex items-center justify-center gap-2.5 p-3.5 border rounded-xl cursor-pointer font-bold text-sm transition {jenis === TRANSACTION_TYPES.MASUK ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
            >
              <input type="radio" name="jenis" value={TRANSACTION_TYPES.MASUK} bind:group={jenis} class="sr-only" />
              <ArrowDownLeft class="w-4 h-4 {jenis === TRANSACTION_TYPES.MASUK ? 'text-teal-700' : 'text-slate-600'}" />
              <span>Kas Masuk</span>
            </label>

            <label
              class="flex items-center justify-center gap-2.5 p-3.5 border rounded-xl cursor-pointer font-bold text-sm transition {jenis === TRANSACTION_TYPES.KELUAR ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
            >
              <input type="radio" name="jenis" value={TRANSACTION_TYPES.KELUAR} bind:group={jenis} class="sr-only" />
              <ArrowUpRight class="w-4 h-4 {jenis === TRANSACTION_TYPES.KELUAR ? 'text-rose-600' : 'text-slate-600'}" />
              <span>Kas Keluar</span>
            </label>
          </div>
        </div>

        <!-- Tanggal & Jumlah menggunakan Input component -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="tanggal"
            name="tanggal"
            type="date"
            label="Tanggal Transaksi"
            bind:value={tanggal}
            required
          />

          <Input
            id="jumlah"
            name="jumlah"
            type="number"
            label="Jumlah Uang (Rupiah)"
            bind:value={jumlah}
            prefix="Rp"
            min="1"
            step="1"
            required
          />
        </div>

        <!-- Kategori & Anggota menggunakan Select component -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="category"
            name="category"
            label="Pos Kategori ({jenis === TRANSACTION_TYPES.MASUK ? 'Pemasukan' : 'Pengeluaran'})"
            bind:value={category_id}
            required
          >
            {#each filteredCategories as cat}
              <option value={String(cat.id)}>{cat.nama}</option>
            {/each}
          </Select>

          <Select
            id="member"
            name="member"
            label="Anggota Terkait (Opsional)"
            bind:value={member_id}
          >
            <option value="">-- Tanpa Anggota Khusus --</option>
            {#each members as m}
              <option value={String(m.id)}>{m.nama}</option>
            {/each}
          </Select>
        </div>

        <!-- Keterangan Transaksi menggunakan Input component -->
        <Input
          id="keterangan"
          name="keterangan"
          type="text"
          label="Keterangan Transaksi"
          bind:value={keterangan}
          placeholder="Catatan transaksi..."
          required
        />

        <!-- Actions -->
        <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <a href={ROUTES.TRANSAKSI}>
            <Button variant="secondary" size="md">
              Batal
            </Button>
          </a>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <span>Perbarui Transaksi</span>
          </Button>
        </div>
      </form>
    </Card>
  {/if}
</div>
