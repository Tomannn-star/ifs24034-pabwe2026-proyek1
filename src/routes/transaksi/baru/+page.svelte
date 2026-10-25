<script>
  import { onMount } from "svelte";
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
  import {
    PlusCircle,
    ArrowLeft,
    ArrowDownLeft,
    ArrowUpRight
  } from "lucide-svelte";

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  let tanggal = $state(getTodayString());
  let jenis = $state(TRANSACTION_TYPES.MASUK);
  let jumlah = $state("");
  let category_id = $state("");
  let member_id = $state("");
  let keterangan = $state("");

  let allCategories = $state([]);
  let members = $state([]);
  let isLoading = $state(false);
  let errorMessage = $state("");

  let filteredCategories = $derived(
    allCategories.filter((cat) => cat.jenis === jenis)
  );

  onMount(async () => {
    try {
      const [catsRes, membersRes] = await Promise.all([
        categoryService.getCategories(),
        memberService.getMembers({ aktif: 1 })
      ]);
      allCategories = catsRes.data || [];
      members = membersRes.data || [];

      if (filteredCategories.length > 0) {
        category_id = String(filteredCategories[0].id);
      }
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Gagal memuat data pilihan");
      toast.error(errorMessage);
    }
  });

  $effect(() => {
    if (filteredCategories.length > 0) {
      const currentSelected = filteredCategories.find((c) => String(c.id) === String(category_id));
      if (!currentSelected) {
        category_id = String(filteredCategories[0].id);
      }
    } else {
      category_id = "";
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

    isLoading = true;
    try {
      await transactionService.createTransaction({
        jenis,
        kategori_id: Number(category_id),
        jumlah: Number(jumlah),
        tanggal,
        keterangan,
        member_id: member_id ? Number(member_id) : null
      });

      toast.success("Transaksi kas berhasil disimpan");
      goto(ROUTES.TRANSAKSI);
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Gagal menyimpan transaksi");
      toast.error(errorMessage);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Catat Transaksi Baru - KasPintar</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
  <PageHeader
    title="Catat Transaksi Kas"
    description="Tambahkan catatan mutasi penerimaan atau pengeluaran kas kelas."
    icon={PlusCircle}
  >
    <a href={ROUTES.TRANSAKSI}>
      <Button variant="secondary" size="sm">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        <span>Kembali</span>
      </Button>
    </a>
  </PageHeader>

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
            <span>Kas Masuk (Pemasukan)</span>
          </label>

          <label
            class="flex items-center justify-center gap-2.5 p-3.5 border rounded-xl cursor-pointer font-bold text-sm transition {jenis === TRANSACTION_TYPES.KELUAR ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            <input type="radio" name="jenis" value={TRANSACTION_TYPES.KELUAR} bind:group={jenis} class="sr-only" />
            <ArrowUpRight class="w-4 h-4 {jenis === TRANSACTION_TYPES.KELUAR ? 'text-rose-600' : 'text-slate-600'}" />
            <span>Kas Keluar (Pengeluaran)</span>
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
          label="Jumlah Uang (Rupiah Utuh)"
          bind:value={jumlah}
          placeholder="Contoh: 50000"
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
          {#if filteredCategories.length === 0}
            <option value="" disabled>Belum ada kategori untuk jenis ini</option>
          {:else}
            {#each filteredCategories as cat}
              <option value={String(cat.id)}>{cat.nama}</option>
            {/each}
          {/if}
        </Select>

        <Select
          id="member"
          name="member"
          label="Terkait Anggota (Opsional)"
          bind:value={member_id}
        >
          <option value="">-- Tidak Terkait Anggota --</option>
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
        label="Keterangan / Catatan Transaksi"
        bind:value={keterangan}
        placeholder="Contoh: Iuran kas mingguan atau Pembelian spidol & penghapus"
        required
      />

      <!-- Tombol Simpan -->
      <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <a href={ROUTES.TRANSAKSI}>
          <Button variant="secondary" size="md">
            Batal
          </Button>
        </a>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={isLoading}
        >
          Simpan Transaksi Kas
        </Button>
      </div>
    </form>
  </Card>
</div>
