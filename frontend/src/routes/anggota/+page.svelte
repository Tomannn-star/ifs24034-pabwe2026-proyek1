<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { toast } from "$lib/stores/toast.js";
  import { formatTanggal } from "$lib/utils/format.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Button from "$lib/components/Button.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import {
    Users,
    UserPlus,
    Search,
    Pencil,
    Trash2,
    Phone,
    CheckCircle2,
    XCircle,
    RotateCcw
  } from "lucide-svelte";

  let members = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state("");

  let searchQuery = $state("");
  let filterAktif = $state("");

  // Modal State untuk Tambah / Edit
  let isFormModalOpen = $state(false);
  let isEditing = $state(false);
  let currentId = $state(null);
  let formNama = $state("");
  let formKontak = $state("");
  let formAktif = $state(1);
  let isSaving = $state(false);

  // Modal Konfirmasi Hapus
  let isDeleteModalOpen = $state(false);
  let memberToDelete = $state(null);
  let isDeleting = $state(false);

  // Modal Konfirmasi Ubah Status
  let isStatusModalOpen = $state(false);
  let memberToToggle = $state(null);
  let isToggling = $state(false);

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
      toast.error(errorMessage);
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
    isFormModalOpen = true;
  }

  function openEditModal(m) {
    isEditing = true;
    currentId = m.id;
    formNama = m.nama;
    formKontak = m.kontak || "";
    formAktif = m.aktif;
    isFormModalOpen = true;
  }

  async function handleSave(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!formNama.trim()) {
      toast.error("Nama anggota wajib diisi");
      return;
    }

    isSaving = true;
    try {
      if (isEditing) {
        await api.put(`members/${currentId}`, {
          nama: formNama.trim(),
          kontak: formKontak.trim() || null,
          aktif: formAktif
        });
        toast.success(`Data anggota "${formNama.trim()}" berhasil diperbarui`);
      } else {
        await api.post("members", {
          nama: formNama.trim(),
          kontak: formKontak.trim() || null,
          aktif: formAktif
        });
        toast.success(`Anggota baru "${formNama.trim()}" berhasil ditambahkan`);
      }

      isFormModalOpen = false;
      loadMembers();
    } catch (err) {
      toast.error(err.message || "Gagal menyimpan data anggota");
    } finally {
      isSaving = false;
    }
  }

  function promptToggleStatus(m) {
    memberToToggle = m;
    isStatusModalOpen = true;
  }

  async function confirmToggleStatus() {
    if (!memberToToggle) return;
    isToggling = true;
    const nextStatus = memberToToggle.aktif === 1 ? 0 : 1;
    try {
      await api.put(`members/${memberToToggle.id}`, {
        nama: memberToToggle.nama,
        kontak: memberToToggle.kontak,
        aktif: nextStatus
      });
      toast.success(
        `Status ${memberToToggle.nama} diubah menjadi ${nextStatus === 1 ? 'Aktif' : 'Nonaktif'}`
      );
      isStatusModalOpen = false;
      memberToToggle = null;
      loadMembers();
    } catch (err) {
      toast.error(err.message || "Gagal mengubah status anggota");
    } finally {
      isToggling = false;
    }
  }

  function promptDelete(m) {
    memberToDelete = m;
    isDeleteModalOpen = true;
  }

  async function confirmDelete() {
    if (!memberToDelete) return;
    isDeleting = true;
    try {
      await api.delete(`members/${memberToDelete.id}`);
      toast.success(`Anggota "${memberToDelete.nama}" berhasil dihapus`);
      isDeleteModalOpen = false;
      memberToDelete = null;
      loadMembers();
    } catch (err) {
      toast.error(err.message || "Gagal menghapus anggota");
    } finally {
      isDeleting = false;
    }
  }
</script>

<svelte:head>
  <title>Kelola Anggota - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <PageHeader
    title="Kelola Anggota Kelas"
    description="Daftar seluruh mahasiswa anggota kas kelas dan status keaktifan penagihan iuran."
    icon={Users}
  >
    <Button variant="primary" size="md" onclick={openAddModal}>
      <UserPlus class="w-4 h-4 mr-1.5" />
      <span>Tambah Anggota</span>
    </Button>
  </PageHeader>

  <!-- Filter & Pencarian -->
  <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search class="w-4 h-4" aria-hidden="true" />
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        oninput={() => loadMembers()}
        placeholder="Cari nama anggota atau nomor kontak..."
        aria-label="Cari nama anggota atau nomor kontak"
        class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
      />
    </div>

    <div class="w-full sm:w-48">
      <select
        bind:value={filterAktif}
        onchange={() => loadMembers()}
        aria-label="Filter status keaktifan anggota"
        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
      >
        <option value="">Semua Status</option>
        <option value="1">Aktif Saja</option>
        <option value="0">Nonaktif Saja</option>
      </select>
    </div>
  </div>

  <!-- Tabel Anggota -->
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600 border-collapse">
        <thead class="bg-slate-50/80 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200/60">
          <tr>
            <th class="py-3.5 px-4 font-bold w-12 text-center">No</th>
            <th class="py-3.5 px-4 font-bold">Nama Anggota</th>
            <th class="py-3.5 px-4 font-bold">Kontak / No. HP</th>
            <th class="py-3.5 px-4 font-bold">Status Keaktifan</th>
            <th class="py-3.5 px-4 font-bold">Terdaftar Sejak</th>
            <th class="py-3.5 px-4 font-bold text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if isLoading}
            <tr>
              <td colspan="6" class="p-12 text-center text-slate-400">
                <div class="inline-block animate-spin rounded-full h-7 w-7 border-2 border-teal-700 border-t-transparent"></div>
                <div class="mt-2 text-xs font-medium">Memuat data anggota kelas...</div>
              </td>
            </tr>
          {:else if members.length === 0}
            <tr>
              <td colspan="6" class="p-12 text-center">
                <EmptyState
                  title="Tidak ada anggota yang ditemukan"
                  description="Coba ubah kata kunci pencarian atau tambahkan data anggota baru."
                  icon={Users}
                />
              </td>
            </tr>
          {:else}
            {#each members as m, idx}
              <tr class="hover:bg-slate-50/70 transition duration-75">
                <td class="py-3.5 px-4 text-center font-semibold text-slate-400 text-xs">
                  {idx + 1}
                </td>
                <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                  {m.nama}
                </td>
                <td class="py-3.5 px-4 text-slate-600 text-xs font-mono whitespace-nowrap">
                  {#if m.kontak}
                    <span class="inline-flex items-center gap-1.5 text-slate-700">
                      <Phone class="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.kontak}</span>
                    </span>
                  {:else}
                    <span class="text-slate-400">-</span>
                  {/if}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onclick={() => promptToggleStatus(m)}
                    class="cursor-pointer"
                    title="Klik untuk mengubah status"
                  >
                    {#if m.aktif === 1}
                      <Badge variant="success" size="sm">
                        <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
                        <span>Aktif</span>
                      </Badge>
                    {:else}
                      <Badge variant="neutral" size="sm">
                        <XCircle class="w-3.5 h-3.5 mr-1" />
                        <span>Nonaktif</span>
                      </Badge>
                    {/if}
                  </button>
                </td>
                <td class="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                  {formatTanggal(m.created_at)}
                </td>
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      onclick={() => openEditModal(m)}
                      class="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                      title="Edit Data Anggota"
                      aria-label="Edit"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      onclick={() => promptDelete(m)}
                      class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus Anggota"
                      aria-label="Hapus"
                    >
                      <Trash2 class="w-4 h-4" />
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
<Modal
  open={isFormModalOpen}
  title={isEditing ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
  confirmText={isEditing ? 'Perbarui Data' : 'Tambah Anggota'}
  cancelText="Batal"
  confirmVariant="primary"
  loading={isSaving}
  onclose={() => (isFormModalOpen = false)}
  onconfirm={handleSave}
>
  <form onsubmit={handleSave} class="space-y-4">
    <div class="space-y-1.5">
      <label for="formNama" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Nama Lengkap
      </label>
      <input
        id="formNama"
        type="text"
        bind:value={formNama}
        placeholder="Contoh: Muhammad Rizky"
        required
        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
      />
    </div>

    <div class="space-y-1.5">
      <label for="formKontak" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Nomor Kontak / WhatsApp
      </label>
      <input
        id="formKontak"
        type="text"
        bind:value={formKontak}
        placeholder="Contoh: 081234567890"
        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
      />
    </div>

    <div class="space-y-1.5">
      <label for="formStatus" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Status Keaktifan
      </label>
      <select
        id="formStatus"
        bind:value={formAktif}
        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
      >
        <option value={1}>Aktif (Menerima Tagihan Iuran Bulanan)</option>
        <option value={0}>Nonaktif (Tidak Ditagih Iuran)</option>
      </select>
    </div>
  </form>
</Modal>

<!-- Modal Konfirmasi Hapus Anggota -->
<Modal
  open={isDeleteModalOpen}
  title="Konfirmasi Hapus Anggota"
  confirmText="Ya, Hapus Anggota"
  cancelText="Batal"
  confirmVariant="danger"
  loading={isDeleting}
  onclose={() => (isDeleteModalOpen = false)}
  onconfirm={confirmDelete}
>
  {#if memberToDelete}
    <p class="text-sm text-slate-600">
      Apakah kamu yakin ingin menghapus data anggota:
    </p>
    <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900">
      {memberToDelete.nama}
    </div>
    <p class="text-xs text-rose-600">
      Peringatan: Seluruh data riwayat tagihan iuran yang terkait dengan anggota ini akan ikut terhapus.
    </p>
  {/if}
</Modal>

<!-- Modal Konfirmasi Ganti Status -->
<Modal
  open={isStatusModalOpen}
  title="Konfirmasi Ubah Status Keaktifan"
  confirmText="Ubah Status"
  cancelText="Batal"
  confirmVariant="primary"
  loading={isToggling}
  onclose={() => (isStatusModalOpen = false)}
  onconfirm={confirmToggleStatus}
>
  {#if memberToToggle}
    <p class="text-sm text-slate-600">
      Ubah status <strong>{memberToToggle.nama}</strong> menjadi
      <strong>{memberToToggle.aktif === 1 ? 'Nonaktif' : 'Aktif'}</strong>?
    </p>
    <p class="text-xs text-slate-500">
      Anggota yang nonaktif tidak akan dimasukkan ke dalam pembuatan tagihan iuran baru secara massal.
    </p>
  {/if}
</Modal>
