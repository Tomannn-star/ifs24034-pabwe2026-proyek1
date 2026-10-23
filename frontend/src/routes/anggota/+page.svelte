<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { formatTanggal } from "$lib/utils/format.js";

  let members = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state("");
  let successMessage = $state("");

  let searchQuery = $state("");
  let filterAktif = $state("");

  // Modal State untuk Tambah / Edit
  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentId = $state(null);
  let formNama = $state("");
  let formKontak = $state("");
  let formAktif = $state(1);
  let isSaving = $state(false);

  onMount(() => {
    loadMembers();
  });

  async function loadMembers() {
    isLoading = true;
    errorMessage = "";
    try {
      const params = new URLSearchParams();
      if (filterAktif !== "") params.set("aktif", filterAktif);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await api.get(`members?${params.toString()}`);
      members = res.data || [];
    } catch (err) {
      errorMessage = err.message || "Gagal memuat daftar anggota";
    } finally {
      isLoading = false;
    }
  }

  function openAddModal() {
    isEditing = false;
    currentId = null;
    formNama = "";
    formKontak = "";
    formAktif = 1;
    isModalOpen = true;
  }

  function openEditModal(m) {
    isEditing = true;
    currentId = m.id;
    formNama = m.nama;
    formKontak = m.kontak || "";
    formAktif = m.aktif;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!formNama.trim()) {
      errorMessage = "Nama anggota wajib diisi";
      return;
    }

    isSaving = true;
    errorMessage = "";
    try {
      if (isEditing) {
        await api.put(`members/${currentId}`, {
          nama: formNama.trim(),
          kontak: formKontak.trim() || null,
          aktif: formAktif
        });
        successMessage = "Data anggota berhasil diperbarui";
      } else {
        await api.post("members", {
          nama: formNama.trim(),
          kontak: formKontak.trim() || null,
          aktif: formAktif
        });
        successMessage = "Anggota baru berhasil ditambahkan";
      }

      closeModal();
      loadMembers();
      setTimeout(() => (successMessage = ""), 3000);
    } catch (err) {
      errorMessage = err.message || "Gagal menyimpan data anggota";
    } finally {
      isSaving = false;
    }
  }

  async function toggleStatus(m) {
    const nextStatus = m.aktif === 1 ? 0 : 1;
    const actionLabel = nextStatus === 1 ? "mengaktifkan" : "menonaktifkan";
    const confirmToggle = window.confirm(`Apakah kamu yakin ingin ${actionLabel} anggota "${m.nama}"?`);
    if (!confirmToggle) return;

    try {
      await api.put(`members/${m.id}`, {
        nama: m.nama,
        kontak: m.kontak,
        aktif: nextStatus
      });
      loadMembers();
    } catch (err) {
      errorMessage = err.message || "Gagal mengubah status anggota";
    }
  }

  async function handleDelete(m) {
    const confirmDelete = window.confirm(
      `Apakah kamu yakin ingin menghapus "${m.nama}"? Semua riwayat tagihan iuran yang terkait akan ikut terhapus.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`members/${m.id}`);
      successMessage = `Anggota "${m.nama}" berhasil dihapus`;
      setTimeout(() => (successMessage = ""), 3000);
      loadMembers();
    } catch (err) {
      errorMessage = err.message || "Gagal menghapus anggota";
    }
  }
</script>

<svelte:head>
  <title>Kelola Anggota - KasPintar</title>
</svelte:head>

<div class="space-y-5">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Kelola Anggota Kelas</h1>
      <p class="text-slate-500 text-sm">Daftar seluruh mahasiswa anggota kas kelas.</p>
    </div>
    <button
      onclick={openAddModal}
      class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
    >
      <span>➕</span> Tambah Anggota
    </button>
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

  <!-- Filter & Pencarian -->
  <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
    <div class="flex-1">
      <input
        type="text"
        bind:value={searchQuery}
        oninput={() => loadMembers()}
        placeholder="Cari nama anggota atau nomor kontak..."
        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    <div class="w-full sm:w-48">
      <select
        bind:value={filterAktif}
        onchange={() => loadMembers()}
        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Semua Status</option>
        <option value="1">Aktif Saja</option>
        <option value="0">Nonaktif Saja</option>
      </select>
    </div>
  </div>

  <!-- Tabel Anggota -->
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
          <tr>
            <th class="py-3.5 px-4">No</th>
            <th class="py-3.5 px-4">Nama Anggota</th>
            <th class="py-3.5 px-4">Kontak / No. HP</th>
            <th class="py-3.5 px-4">Status</th>
            <th class="py-3.5 px-4">Terdaftar Sejak</th>
            <th class="py-3.5 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if isLoading}
            <tr>
              <td colspan="6" class="p-8 text-center text-slate-400">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                <div class="mt-2 text-xs">Memuat data anggota...</div>
              </td>
            </tr>
          {:else if members.length === 0}
            <tr>
              <td colspan="6" class="p-8 text-center text-slate-400">
                Tidak ada data anggota yang ditemukan
              </td>
            </tr>
          {:else}
            {#each members as m, idx}
              <tr class="hover:bg-slate-50/70 transition">
                <td class="py-3.5 px-4 font-semibold text-slate-400 text-xs">{idx + 1}</td>
                <td class="py-3.5 px-4 font-bold text-slate-800">{m.nama}</td>
                <td class="py-3.5 px-4 text-slate-600 text-xs font-mono">{m.kontak || "-"}</td>
                <td class="py-3.5 px-4">
                  <button
                    onclick={() => toggleStatus(m)}
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition {m.aktif === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}"
                    title="Klik untuk mengubah status"
                  >
                    <span class="w-1.5 h-1.5 rounded-full {m.aktif === 1 ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                    <span>{m.aktif === 1 ? 'Aktif' : 'Nonaktif'}</span>
                  </button>
                </td>
                <td class="py-3.5 px-4 text-xs text-slate-400">{formatTanggal(m.created_at)}</td>
                <td class="py-3.5 px-4 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      onclick={() => openEditModal(m)}
                      class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Data Anggota"
                    >
                      ✏️
                    </button>
                    <button
                      onclick={() => handleDelete(m)}
                      class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Anggota"
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

<!-- Modal Tambah / Edit Anggota -->
{#if isModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
    <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 class="font-bold text-lg text-slate-900">
          {isEditing ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
        </h3>
        <button onclick={closeModal} class="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
      </div>

      <form onsubmit={handleSave} class="space-y-4">
        <div>
          <label for="formNama" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Nama Lengkap
          </label>
          <input
            id="formNama"
            type="text"
            bind:value={formNama}
            placeholder="Contoh: Muhammad Rizky"
            required
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="formKontak" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Kontak / No. WhatsApp
          </label>
          <input
            id="formKontak"
            type="text"
            bind:value={formKontak}
            placeholder="Contoh: 081234567890"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="formStatus" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Status Keaktifan
          </label>
          <select
            id="formStatus"
            bind:value={formAktif}
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>Aktif (Menerima Tagihan Iuran)</option>
            <option value={0}>Nonaktif (Tidak Ditagih Iuran)</option>
          </select>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onclick={closeModal}
            class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

