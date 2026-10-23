<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { goto } from "$app/navigation";

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

  // Filter kategori berdasarkan jenis yang dipilih
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

      // Pilih kategori pertama yang cocok secara otomatis
      if (filteredCategories.length > 0) {
        category_id = String(filteredCategories[0].id);
      }
    } catch (err) {
      errorMessage = err.message || "Gagal memuat opsi form transaksi";
    }
  });

  // Saat jenis berubah, sesuaikan kategori yang dipilih jika tidak cocok
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
      errorMessage = "Jumlah transaksi harus berupa bilangan bulat positif lebih dari 0";
      return;
    }

    if (!category_id) {
      errorMessage = "Kategori transaksi wajib dipilih";
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

      goto("/transaksi");
    } catch (err) {
      errorMessage = err.message || "Gagal menyimpan transaksi";
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Catat Transaksi Baru - KasPintar</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-5">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Catat Transaksi Baru</h1>
      <p class="text-slate-500 text-sm">Tambahkan catatan penerimaan atau pengeluaran kas kelas.</p>
    </div>
    <a href="/transaksi" class="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
      &larr; Kembali
    </a>
  </div>

  {#if errorMessage}
    <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center justify-between">
      <span>⚠️ {errorMessage}</span>
      <button onclick={() => (errorMessage = "")} class="text-xs font-bold">&times;</button>
    </div>
  {/if}

  <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
    <form onsubmit={handleSubmit} class="space-y-5">
      <!-- Jenis Transaksi (Masuk / Keluar) -->
      <div>
        <span class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          Jenis Transaksi
        </span>
        <div class="grid grid-cols-2 gap-3">
          <label
            class="flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer font-bold text-sm transition {jenis === 'masuk' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            <input type="radio" name="jenis" value="masuk" bind:group={jenis} class="sr-only" />
            <span>📥 Kas Masuk</span>
          </label>

          <label
            class="flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer font-bold text-sm transition {jenis === 'keluar' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            <input type="radio" name="jenis" value="keluar" bind:group={jenis} class="sr-only" />
            <span>📤 Kas Keluar</span>
          </label>
        </div>
      </div>

      <!-- Tanggal & Jumlah -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="tanggal" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Tanggal Transaksi
          </label>
          <input
            id="tanggal"
            type="date"
            bind:value={tanggal}
            required
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="jumlah" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Jumlah Uang (Rupiah Utuh)
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">Rp</span>
            <input
              id="jumlah"
              type="number"
              bind:value={jumlah}
              placeholder="Contoh: 25000"
              min="1"
              step="1"
              required
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>
        </div>
      </div>

      <!-- Kategori & Anggota (Opsional) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="category" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Kategori ({jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'})
          </label>
          <select
            id="category"
            bind:value={category_id}
            required
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        <div>
          <label for="member" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Terkait Anggota (Opsional)
          </label>
          <select
            id="member"
            bind:value={member_id}
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Tanpa Anggota Khusus --</option>
            {#each members as m}
              <option value={m.id}>{m.nama}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Keterangan Transaksi -->
      <div>
        <label for="keterangan" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Keterangan Transaksi
        </label>
        <textarea
          id="keterangan"
          bind:value={keterangan}
          rows="3"
          placeholder="Tuliskan rincian transaksi (misal: Pembelian spidol kelas, donasi bazar, dll)"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <!-- Tombol Simpan -->
      <div class="pt-2 flex items-center justify-end gap-3">
        <a
          href="/transaksi"
          class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm rounded-xl transition"
        >
          Batal
        </a>
        <button
          type="submit"
          disabled={isLoading}
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {#if isLoading}
            <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Menyimpan...</span>
          {:else}
            <span>Simpan Transaksi</span>
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>

