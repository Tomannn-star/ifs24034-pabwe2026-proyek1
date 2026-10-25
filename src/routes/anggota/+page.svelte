<script>
  import { onMount } from "svelte";
  import { memberService } from "$lib/services/memberService.js";
  import { toast } from "$lib/stores/toast.js";
  import { formatTanggal } from "$lib/utils/format.js";
  import { validateName, validatePhone } from "$lib/utils/validators.js";
  import { extractErrorMessage } from "$lib/utils/errorHandler.js";
  import { BADGE_VARIANTS, MODAL_VARIANTS } from "$lib/constants/index.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Button from "$lib/components/Button.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Input from "$lib/components/Input.svelte";
  import Select from "$lib/components/Select.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import {
    Users,
    UserPlus,
    Pencil,
    Trash2,
    Phone,
    CheckCircle2,
    XCircle
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
      const res = await memberService.getMembers({
        aktif: filterAktif,
        q: searchQuery
      });
      members = res.data || [];
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Gagal memuat daftar anggota");
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

    const nameErr = validateName(formNama);
    if (nameErr) {
      toast.error(nameErr);
      return;
    }

    const phoneErr = validatePhone(formKontak);
    if (phoneErr) {
      toast.error(phoneErr);
      return;
    }

    isSaving = true;
    try {
      if (isEditing) {
        await memberService.updateMember(currentId, {
          nama: formNama,
          kontak: formKontak,
          aktif: formAktif
        });
        toast.success(`Data anggota "${formNama.trim()}" berhasil diperbarui`);
      } else {
        await memberService.createMember({
          nama: formNama,
          kontak: formKontak,
          aktif: formAktif
        });
        toast.success(`Anggota baru "${formNama.trim()}" berhasil ditambahkan`);
      }

      isFormModalOpen = false;
      loadMembers();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menyimpan data anggota"));
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
      await memberService.toggleStatus(memberToToggle);
      toast.success(
        `Status ${memberToToggle.nama} diubah menjadi ${nextStatus === 1 ? 'Aktif' : 'Nonaktif'}`
      );
      isStatusModalOpen = false;
      memberToToggle = null;
      loadMembers();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal mengubah status anggota"));
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
      await memberService.deleteMember(memberToDelete.id);
      toast.success(`Anggota "${memberToDelete.nama}" berhasil dihapus`);
      isDeleteModalOpen = false;
      memberToDelete = null;
      loadMembers();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menghapus anggota"));
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

  <!-- Filter & Pencarian menggunakan Input & Select -->
  <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
    <div class="flex-1 w-full">
      <Input
        id="searchQuery"
        bind:value={searchQuery}
        oninput={() => loadMembers()}
        placeholder="Cari nama anggota atau nomor kontak..."
        aria-label="Cari nama anggota atau nomor kontak"
      />
    </div>

    <div class="w-full sm:w-48">
      <Select
        id="filterAktif"
        bind:value={filterAktif}
        onchange={() => loadMembers()}
        aria-label="Filter status keaktifan anggota"
      >
        <option value="">Semua Status</option>
        <option value="1">Aktif Saja</option>
        <option value="0">Nonaktif Saja</option>
      </Select>
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
              <td colspan="6" class="p-12 text-center text-slate-600">
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
                <td class="py-3.5 px-4 text-center font-semibold text-slate-600 text-xs">
                  {idx + 1}
                </td>
                <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                  {m.nama}
                </td>
                <td class="py-3.5 px-4 text-slate-600 text-xs font-mono whitespace-nowrap">
                  {#if m.kontak}
                    <span class="inline-flex items-center gap-1.5 text-slate-700">
                      <Phone class="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span>{m.kontak}</span>
                    </span>
                  {:else}
                    <span class="text-slate-600">-</span>
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
                      <Badge variant={BADGE_VARIANTS.SUCCESS} size="sm">
                        <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
                        <span>Aktif</span>
                      </Badge>
                    {:else}
                      <Badge variant={BADGE_VARIANTS.NEUTRAL} size="sm">
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
                      class="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                      title="Edit Data Anggota"
                      aria-label="Edit data anggota {m.nama}"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      onclick={() => promptDelete(m)}
                      class="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus Anggota"
                      aria-label="Hapus data anggota {m.nama}"
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
  confirmLabel={isEditing ? 'Perbarui Data' : 'Tambah Anggota'}
  cancelLabel="Batal"
  variant={MODAL_VARIANTS.PRIMARY}
  loading={isSaving}
  onclose={() => (isFormModalOpen = false)}
  onconfirm={handleSave}
>
  <form onsubmit={handleSave} class="space-y-4">
    <Input
      id="formNama"
      name="formNama"
      label="Nama Lengkap"
      bind:value={formNama}
      placeholder="Contoh: Muhammad Rizky"
      required
    />

    <Input
      id="formKontak"
      name="formKontak"
      label="Nomor Kontak / WhatsApp"
      bind:value={formKontak}
      placeholder="Contoh: 081234567890"
    />

    <Select
      id="formStatus"
      name="formStatus"
      label="Status Keaktifan"
      bind:value={formAktif}
    >
      <option value={1}>Aktif (Menerima Tagihan Iuran Bulanan)</option>
      <option value={0}>Nonaktif (Tidak Ditagih Iuran)</option>
    </Select>
  </form>
</Modal>

<!-- Modal Konfirmasi Hapus Anggota -->
<Modal
  open={isDeleteModalOpen}
  title="Konfirmasi Hapus Anggota"
  confirmLabel="Ya, Hapus Anggota"
  cancelLabel="Batal"
  variant={MODAL_VARIANTS.DANGER}
  loading={isDeleting}
  onclose={() => (isDeleteModalOpen = false)}
  onconfirm={confirmDelete}
>
  {#if memberToDelete}
    <div class="space-y-3">
      <p class="text-sm text-slate-600">
        Apakah kamu yakin ingin menghapus data anggota:
      </p>
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900">
        {memberToDelete.nama}
      </div>
      <p class="text-xs text-rose-600">
        Peringatan: Seluruh data riwayat tagihan iuran yang terkait dengan anggota ini akan ikut terhapus.
      </p>
    </div>
  {/if}
</Modal>

<!-- Modal Konfirmasi Ganti Status -->
<Modal
  open={isStatusModalOpen}
  title="Konfirmasi Ubah Status Keaktifan"
  confirmLabel="Ubah Status"
  cancelLabel="Batal"
  variant={MODAL_VARIANTS.PRIMARY}
  loading={isToggling}
  onclose={() => (isStatusModalOpen = false)}
  onconfirm={confirmToggleStatus}
>
  {#if memberToToggle}
    <div class="space-y-2">
      <p class="text-sm text-slate-600">
        Ubah status <strong>{memberToToggle.nama}</strong> menjadi
        <strong>{memberToToggle.aktif === 1 ? 'Nonaktif' : 'Aktif'}</strong>?
      </p>
      <p class="text-xs text-slate-500">
        Anggota yang nonaktif tidak akan dimasukkan ke dalam pembuatan tagihan iuran baru secara massal.
      </p>
    </div>
  {/if}
</Modal>
