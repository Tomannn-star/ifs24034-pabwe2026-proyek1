<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";

  let categories = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state("");
  let successMessage = $state("");

  // Form state
  let isEditing = $state(false);
  let editId = $state(null);
  let nama = $state("");
  let jenis = $state("masuk");
  let isSaving = $state(false);

  onMount(() => {
    loadCategories();
  });

  async function loadCategories() {
    isLoading = true;
    errorMessage = "";
    try {
      const res = await api.get("categories");
      categories = res.data || [];
    } catch (err) {
      errorMessage = err.message || "Gagal memuat kategori";
    } finally {
      isLoading = false;
    }
  }

  function startEdit(cat) {
    isEditing = true;
    editId = cat.id;
    nama = cat.nama;
    jenis = cat.jenis;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    isEditing = false;
    editId = null;
    nama = "";
    jenis = "masuk";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nama.trim()) {
      errorMessage = "Nama kategori tidak boleh kosong";
      return;
    }

    isSaving = true;
    errorMessage = "";
    try {
      if (isEditing) {
        await api.put(`categories/${editId}`, {
          nama: nama.trim(),
          jenis
        });
        successMessage = "Kategori berhasil diperbarui";
      } else {
        await api.post("categories", {
          nama: nama.trim(),
          jenis
        });
        successMessage = "Kategori baru berhasil ditambahkan";
      }

      cancelEdit();
      loadCategories();
      setTimeout(() => (successMessage = ""), 3000);
    } catch (err) {
      errorMessage = err.message || "Gagal menyimpan kategori";
    } finally {
      isSaving = false;
    }
  }

  async function handleDelete(cat) {
    const confirmDelete = window.confirm(`Apakah kamu yakin ingin menghapus kategori "${cat.nama}"?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`categories/${cat.id}`);
      successMessage = `Kategori "${cat.nama}" berhasil dihapus`;
      setTimeout(() => (successMessage = ""), 3000);
      loadCategories();
    } catch (err) {
      errorMessage = err.message || "Gagal menghapus kategori";
    }
  }
</script>

<svelte:head>
  <title>Kelola Kategori - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Kelola Kategori Kas</h1>
    <p class="text-slate-500 text-sm">Atur klasifikasi pos transaksi pemasukan dan pengeluaran kas kelas.</p>
  </div>

  {#if successMessage}
    <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
      ✅ {successMessage}
    </div>
  {/if}

  {#if errorMessage}
    <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center justify-between">
      <span>⚠️ {errorMessage}</span>
      <button onclick={() => (errorMessage = "")} class="text-xs font-bold">&times;</button>
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Form Tambah / Edit Kategori -->
    <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-fit">
      <h2 class="font-bold text-slate-900 text-base mb-4">
        {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      </h2>

      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="namaKategori" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Nama Kategori
          </label>
          <input
            id="namaKategori"
            type="text"
            bind:value={nama}
            placeholder="Contoh: Dana Perlengkapan"
            required
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="jenisKategori" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Jenis Kategori
          </label>
          <select
            id="jenisKategori"
            bind:value={jenis}
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="masuk">Pemasukan (Kas Masuk)</option>
            <option value="keluar">Pengeluaran (Kas Keluar)</option>
          </select>
        </div>

        <div class="pt-2 flex items-center gap-2">
          {#if isEditing}
            <button
              type="button"
              onclick={cancelEdit}
              class="w-1/2 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm rounded-xl transition"
            >
              Batal
            </button>
          {/if}
          <button
            type="submit"
            disabled={isSaving}
            class="{isEditing ? 'w-1/2' : 'w-full'} py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSaving ? 'Menyimpan...' : (isEditing ? 'Perbarui' : 'Tambah Kategori')}
          </button>
        </div>
      </form>
    </div>

    <!-- Tabel Daftar Kategori -->
    <div class="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-100">
        <h2 class="font-bold text-slate-900 text-base">Daftar Kategori Terdaftar</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
            <tr>
              <th class="py-3 px-4">No</th>
              <th class="py-3 px-4">Nama Kategori</th>
              <th class="py-3 px-4">Jenis</th>
              <th class="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#if isLoading}
              <tr>
                <td colspan="4" class="p-6 text-center text-slate-400">
                  <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
                </td>
              </tr>
            {:else if categories.length === 0}
              <tr>
                <td colspan="4" class="p-6 text-center text-slate-400">
                  Belum ada kategori yang dibuat
                </td>
              </tr>
            {:else}
              {#each categories as cat, idx}
                <tr class="hover:bg-slate-50/70 transition">
                  <td class="py-3 px-4 font-semibold text-slate-400 text-xs">{idx + 1}</td>
                  <td class="py-3 px-4 font-bold text-slate-800">{cat.nama}</td>
                  <td class="py-3 px-4">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold {cat.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                      {cat.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        onclick={() => startEdit(cat)}
                        class="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Kategori"
                      >
                        ✏️
                      </button>
                      <button
                        onclick={() => handleDelete(cat)}
                        class="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Kategori"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
