<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { goto } from "$app/navigation";
  import { toast } from "$lib/stores/toast.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Card from "$lib/components/Card.svelte";
  import Button from "$lib/components/Button.svelte";
  import {
    PlusCircle,
    ArrowLeft,
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    Coins,
    Tag,
    User,
    FileText
  } from "lucide-svelte";

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  let tanggal = $state(getTodayString());
  let jenis = $state("masuk");
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
        api.get("categories"),
        api.get("members?aktif=1")
      ]);
      allCategories = catsRes.data || [];
      members = membersRes.data || [];

      if (filteredCategories.length > 0) {
        category_id = String(filteredCategories[0].id);
      }
    } catch (err) {
      errorMessage = err.message || "Gagal memuat data pilihan";
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

    const nominal = parseInt(jumlah, 10);
    if (isNaN(nominal) || nominal <= 0) {
      errorMessage = "Jumlah transaksi harus berupa angka bulat positif (Rp)";
      toast.error(errorMessage);
      return;
    }

    if (!category_id) {
      errorMessage = "Kategori transaksi wajib dipilih";
      toast.error(errorMessage);
      return;
    }

    isLoading = true;
    try {
      await api.post("transactions", {
        tanggal,
        jenis,
        jumlah: nominal,
        category_id: parseInt(category_id, 10),
        member_id: member_id ? parseInt(member_id, 10) : null,
        keterangan: keterangan.trim()
      });

      toast.success("Transaksi kas berhasil disimpan");
      goto("/transaksi");
    } catch (err) {
      errorMessage = err.message || "Gagal menyimpan transaksi";
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
    <a href="/transaksi">
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
            class="flex items-center justify-center gap-2.5 p-3.5 border rounded-xl cursor-pointer font-bold text-sm transition {jenis === 'masuk' ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            <input type="radio" name="jenis" value="masuk" bind:group={jenis} class="sr-only" />
            <ArrowDownLeft class="w-4 h-4 {jenis === 'masuk' ? 'text-teal-700' : 'text-slate-600'}" />
            <span>Kas Masuk (Pemasukan)</span>
          </label>

          <label
            class="flex items-center justify-center gap-2.5 p-3.5 border rounded-xl cursor-pointer font-bold text-sm transition {jenis === 'keluar' ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            <input type="radio" name="jenis" value="keluar" bind:group={jenis} class="sr-only" />
            <ArrowUpRight class="w-4 h-4 {jenis === 'keluar' ? 'text-rose-600' : 'text-slate-600'}" />
            <span>Kas Keluar (Pengeluaran)</span>
          </label>
        </div>
      </div>

      <!-- Tanggal & Jumlah -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label for="tanggal" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Tanggal Transaksi
          </label>
          <input
            id="tanggal"
            type="date"
            bind:value={tanggal}
            required
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
          />
        </div>

        <div class="space-y-1.5">
          <label for="jumlah" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Jumlah Uang (Rupiah Utuh)
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-2.5 text-slate-600 text-sm font-semibold select-none">Rp</span>
            <input
              id="jumlah"
              type="number"
              bind:value={jumlah}
              placeholder="Contoh: 50000"
              min="1"
              step="1"
              required
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-bold tabular-nums transition"
            />
          </div>
        </div>
      </div>

      <!-- Kategori & Anggota -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label for="category" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Pos Kategori ({jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'})
          </label>
          <select
            id="category"
            bind:value={category_id}
            required
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
          >
            {#if filteredCategories.length === 0}
              <option value="">Tidak ada kategori {jenis}</option>
            {:else}
              {#each filteredCategories as cat}
                <option value={cat.id}>{cat.nama}</option>
              {/each}
            {/if}
          </select>
        </div>

        <div class="space-y-1.5">
          <label for="member" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Anggota Terkait (Opsional)
          </label>
          <select
            id="member"
            bind:value={member_id}
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
          >
            <option value="">-- Tanpa Anggota Khusus --</option>
            {#each members as m}
              <option value={m.id}>{m.nama}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Keterangan Transaksi -->
      <div class="space-y-1.5">
        <label for="keterangan" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Keterangan Transaksi
        </label>
        <textarea
          id="keterangan"
          bind:value={keterangan}
          rows="3"
          placeholder="Tuliskan catatan transaksi (contoh: Belanja spidol dan penghapus whiteboard, donasi lomba, dll)"
          class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
        <a href="/transaksi">
          <Button variant="secondary" size="md">
            Batal
          </Button>
        </a>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
        >
          <span>Simpan Transaksi Kas</span>
        </Button>
      </div>
    </form>
  </Card>
</div>
