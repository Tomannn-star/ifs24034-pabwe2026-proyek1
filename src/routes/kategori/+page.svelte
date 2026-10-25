<script>
  import { onMount } from "svelte";
  import { categoryService } from "$lib/services/categoryService.js";
  import { toast } from "$lib/stores/toast.js";
  import { validateName } from "$lib/utils/validators.js";
  import { extractErrorMessage } from "$lib/utils/errorHandler.js";
  import { TRANSACTION_TYPES, BADGE_VARIANTS, MODAL_VARIANTS } from "$lib/constants/index.js";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Card from "$lib/components/Card.svelte";
  import Button from "$lib/components/Button.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Input from "$lib/components/Input.svelte";
  import Select from "$lib/components/Select.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import {
    Tag,
    Plus,
    Pencil,
    Trash2,
    ArrowDownLeft,
    ArrowUpRight
  } from "lucide-svelte";

  let categories = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state("");

  // Form State
  let isEditing = $state(false);
  let editId = $state(null);
  let nama = $state("");
  let jenis = $state(TRANSACTION_TYPES.MASUK);
  let isSaving = $state(false);

  // Modal State untuk Hapus
  let isDeleteModalOpen = $state(false);
  let categoryToDelete = $state(null);
  let isDeleting = $state(false);

  onMount(() => {
    loadCategories();
  });

  async function loadCategories() {
    isLoading = true;
    errorMessage = "";
    try {
      const res = await categoryService.getCategories();
      categories = res.data || [];
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Gagal memuat kategori pos kas");
      toast.error(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  function startEdit(cat) {
    isEditing = true;
    editId = cat.id;
    nama = cat.nama;
    jenis = cat.jenis;
  }

  function cancelEdit() {
    isEditing = false;
    editId = null;
    nama = "";
    jenis = TRANSACTION_TYPES.MASUK;
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nameErr = validateName(nama);
    if (nameErr) {
      toast.error(nameErr);
      return;
    }

    isSaving = true;
    try {
      if (isEditing) {
        await categoryService.updateCategory(editId, { nama, jenis });
        toast.success(`Kategori "${nama.trim()}" berhasil diperbarui`);
      } else {
        await categoryService.createCategory({ nama, jenis });
        toast.success(`Kategori "${nama.trim()}" berhasil ditambahkan`);
      }

      cancelEdit();
      loadCategories();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menyimpan kategori"));
    } finally {
      isSaving = false;
    }
  }

  function promptDelete(cat) {
    categoryToDelete = cat;
    isDeleteModalOpen = true;
  }

  async function confirmDelete() {
    if (!categoryToDelete) return;
    isDeleting = true;
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      toast.success(`Kategori "${categoryToDelete.nama}" berhasil dihapus`);
      isDeleteModalOpen = false;
      categoryToDelete = null;
      loadCategories();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menghapus pos kategori"));
    } finally {
      isDeleting = false;
    }
  }
</script>

<svelte:head>
  <title>Kelola Kategori - KasPintar</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <PageHeader
    title="Kelola Pos Kategori Kas"
    description="Atur klasifikasi pos transaksi kas masuk dan kas keluar kas kelas."
    icon={Tag}
  />

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Form Tambah / Edit Kategori (5 Kolom di Desktop) -->
    <div class="lg:col-span-5 h-fit">
      <Card>
        <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            {#if isEditing}
              <Pencil class="w-4 h-4" />
            {:else}
              <Plus class="w-4 h-4" />
            {/if}
          </div>
          <h2 class="font-bold text-slate-900 text-base">
            {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h2>
        </div>

        <form onsubmit={handleSubmit} class="space-y-4">
          <Input
            id="namaKategori"
            name="namaKategori"
            label="Nama Pos Kategori"
            bind:value={nama}
            placeholder="Contoh: Dana Perlengkapan Kelas"
            required
          />

          <Select
            id="jenisKategori"
            name="jenisKategori"
            label="Klasifikasi Jenis"
            bind:value={jenis}
          >
            <option value={TRANSACTION_TYPES.MASUK}>Kas Masuk (Pemasukan)</option>
            <option value={TRANSACTION_TYPES.KELUAR}>Kas Keluar (Pengeluaran)</option>
          </Select>

          <div class="pt-2 flex items-center gap-2">
            {#if isEditing}
              <Button variant="secondary" size="md" class="w-1/2" onclick={cancelEdit}>
                Batal
              </Button>
            {/if}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSaving}
              class={isEditing ? 'w-1/2' : 'w-full'}
            >
              <span>{isEditing ? 'Perbarui Kategori' : 'Tambah Kategori'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>

    <!-- Tabel Daftar Kategori (7 Kolom di Desktop) -->
    <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-slate-900 text-base">Pos Kategori Terdaftar</h2>
        <span class="text-xs text-slate-600 font-semibold">{categories.length} Pos</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600 border-collapse">
          <thead class="bg-slate-50/80 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200/60">
            <tr>
              <th class="py-3 px-4 font-bold w-12 text-center">No</th>
              <th class="py-3 px-4 font-bold">Nama Kategori</th>
              <th class="py-3 px-4 font-bold">Jenis</th>
              <th class="py-3 px-4 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#if isLoading}
              <tr>
                <td colspan="4" class="p-8 text-center text-slate-500">
                  <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-700 border-t-transparent"></div>
                  <div class="mt-2 text-xs font-medium">Memuat kategori...</div>
                </td>
              </tr>
            {:else if categories.length === 0}
              <tr>
                <td colspan="4" class="p-8 text-center">
                  <EmptyState
                    title="Belum ada kategori yang dibuat"
                    description="Tambahkan pos kategori pemasukan atau pengeluaran kas melalui form di samping."
                    icon={Tag}
                  />
                </td>
              </tr>
            {:else}
              {#each categories as cat, idx}
                <tr class="hover:bg-slate-50/70 transition duration-75">
                  <td class="py-3 px-4 font-semibold text-slate-600 text-xs text-center">
                    {idx + 1}
                  </td>
                  <td class="py-3 px-4 font-bold text-slate-900">
                    {cat.nama}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    {#if cat.jenis === TRANSACTION_TYPES.MASUK}
                      <Badge variant={BADGE_VARIANTS.SUCCESS} size="sm">
                        <ArrowDownLeft class="w-3.5 h-3.5 mr-1" />
                        <span>Pemasukan</span>
                      </Badge>
                    {:else}
                      <Badge variant={BADGE_VARIANTS.DANGER} size="sm">
                        <ArrowUpRight class="w-3.5 h-3.5 mr-1" />
                        <span>Pengeluaran</span>
                      </Badge>
                    {/if}
                  </td>
                  <td class="py-3 px-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        onclick={() => startEdit(cat)}
                        class="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                        title="Edit Kategori"
                        aria-label="Edit kategori {cat.nama}"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button
                        onclick={() => promptDelete(cat)}
                        class="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Kategori"
                        aria-label="Hapus kategori {cat.nama}"
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
</div>

<!-- Modal Konfirmasi Hapus Kategori -->
<Modal
  open={isDeleteModalOpen}
  title="Konfirmasi Hapus Kategori"
  confirmLabel="Ya, Hapus Kategori"
  cancelLabel="Batal"
  variant={MODAL_VARIANTS.DANGER}
  loading={isDeleting}
  onclose={() => (isDeleteModalOpen = false)}
  onconfirm={confirmDelete}
>
  {#if categoryToDelete}
    <div class="space-y-3">
      <p class="text-sm text-slate-600">
        Apakah kamu yakin ingin menghapus pos kategori:
      </p>
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900">
        {categoryToDelete.nama} ({categoryToDelete.jenis === TRANSACTION_TYPES.MASUK ? 'Pemasukan' : 'Pengeluaran'})
      </div>
      <p class="text-xs text-rose-600">
        Perhatian: Kategori tidak dapat dihapus jika masih ada catatan transaksi yang menggunakan pos ini.
      </p>
    </div>
  {/if}
</Modal>
