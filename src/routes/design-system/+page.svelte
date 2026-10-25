<script>
  import {
    Button,
    Badge,
    Card,
    StatCard,
    Input,
    Select,
    Modal,
    Toast,
    EmptyState,
    Skeleton,
    Pagination,
    PageHeader
  } from "$lib/components";
  import { toast } from "$lib/stores/toast.js";
  import { Wallet, ArrowDownLeft, ArrowUpRight, AlertCircle, CheckCircle2, Search } from "lucide-svelte";

  let inputValue = $state("");
  let selectValue = $state("aktif");
  let isModalOpen = $state(false);
  let currentPage = $state(1);

  function triggerSuccessToast() {
    toast.success("Data transaksi berhasil dicatat ke sistem kas!");
  }

  function triggerErrorToast() {
    toast.error("Gagal menghubungkan ke server API KasPintar.");
  }
</script>

<svelte:head>
  <title>Design System - KasPintar</title>
</svelte:head>

<div class="space-y-8 max-w-5xl mx-auto pb-12">
  <PageHeader
    title="Design System & Komponen Reusable KasPintar"
    description="Showcase design tokens, tipografi Plus Jakarta Sans, palet Emerald/Teal, dan komponen UI modern fintech."
    icon={Wallet}
  >
    <Button variant="secondary" size="sm" onclick={triggerSuccessToast}>
      Uji Toast Sukses
    </Button>
    <Button variant="danger" size="sm" onclick={triggerErrorToast}>
      Uji Toast Error
    </Button>
  </PageHeader>

  <!-- Section 1: Design Tokens & Warna -->
  <Card class="space-y-4">
    <h2 class="text-base font-extrabold text-slate-900 tracking-tight">1. Design Tokens & Palet Warna</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
      <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-semibold">
        Primary 50
      </div>
      <div class="p-3 bg-teal-100 border border-teal-300 rounded-xl text-teal-900 font-semibold">
        Primary 100
      </div>
      <div class="p-3 bg-teal-600 text-white rounded-xl font-semibold">
        Primary 600
      </div>
      <div class="p-3 bg-teal-700 text-white rounded-xl font-semibold shadow-xs">
        Primary 700 (#0F766E)
      </div>
      <div class="p-3 bg-teal-800 text-white rounded-xl font-semibold">
        Primary 800
      </div>
      <div class="p-3 bg-teal-900 text-white rounded-xl font-semibold">
        Primary 900
      </div>
    </div>
  </Card>

  <!-- Section 2: StatCards (Fintech Metrics) -->
  <div class="space-y-3">
    <h2 class="text-base font-extrabold text-slate-900 tracking-tight">2. StatCard (Fintech KPI)</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Saldo Kas Kelas"
        value="Rp 1.250.000"
        subtext="Saldo kas aktif siap digunakan"
        variant="primary"
        icon={Wallet}
      />
      <StatCard
        title="Total Pemasukan"
        value="Rp 1.750.000"
        subtext="Total iuran kas & donasi masuk"
        variant="success"
        icon={ArrowDownLeft}
      />
      <StatCard
        title="Total Pengeluaran"
        value="Rp 500.000"
        subtext="Belanja operasional kelas"
        variant="danger"
        icon={ArrowUpRight}
      />
    </div>
  </div>

  <!-- Section 3: Buttons & Badges -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card class="space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 tracking-tight">3. Buttons (Varian & State)</h2>
      <div class="flex flex-wrap gap-2.5 items-center">
        <Button variant="primary" size="md">Primary</Button>
        <Button variant="secondary" size="md">Secondary</Button>
        <Button variant="danger" size="md">Danger</Button>
        <Button variant="ghost" size="md">Ghost</Button>
      </div>
      <div class="flex flex-wrap gap-2.5 items-center pt-2">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
        <Button variant="primary" loading={true}>Loading</Button>
        <Button variant="secondary" disabled={true}>Disabled</Button>
      </div>
    </Card>

    <Card class="space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 tracking-tight">4. Badges Semantik</h2>
      <div class="flex flex-wrap gap-2.5 items-center">
        <Badge variant="success" dot={true}>Lunas / Masuk</Badge>
        <Badge variant="danger" dot={true}>Terlambat / Keluar</Badge>
        <Badge variant="warning" dot={true}>Belum Lunas</Badge>
        <Badge variant="info" dot={true}>Diproses</Badge>
        <Badge variant="neutral">Kategori</Badge>
      </div>
    </Card>
  </div>

  <!-- Section 4: Form Controls -->
  <Card class="space-y-4">
    <h2 class="text-base font-extrabold text-slate-900 tracking-tight">5. Form Inputs & Selects</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Input
        label="Nama Anggota"
        placeholder="Contoh: Budi Santoso"
        bind:value={inputValue}
        hint="Gunakan nama lengkap mahasiswa"
        required={true}
      />

      <Input
        label="Nominal Transaksi"
        placeholder="25000"
        type="number"
        prefix="Rp"
        required={true}
      />

      <Select
        label="Status Keaktifan"
        bind:value={selectValue}
      >
        <option value="aktif">Aktif (Wajib Iuran)</option>
        <option value="nonaktif">Nonaktif</option>
      </Select>
    </div>

    <!-- Contoh State Error -->
    <div class="pt-2">
      <Input
        label="Input dengan Pesan Error Validasi"
        value="invalid_value"
        error="Nilai yang dimasukkan tidak valid atau format salah"
      />
    </div>
  </Card>

  <!-- Section 5: Modal & Empty State & Skeleton -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card class="space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 tracking-tight">6. Modal Konfirmasi</h2>
      <p class="text-xs text-slate-500">
        Menggantikan dialog <code>confirm()</code> bawaan browser dengan modal modern yang rapi.
      </p>
      <Button variant="danger" onclick={() => (isModalOpen = true)}>
        Buka Modal Konfirmasi
      </Button>

      <Modal
        bind:open={isModalOpen}
        title="Hapus Transaksi Kas?"
        message="Apakah kamu yakin ingin menghapus catatan transaksi ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Transaksi"
        variant="danger"
        onconfirm={() => {
          isModalOpen = false;
          toast.success("Transaksi berhasil dihapus");
        }}
      />
    </Card>

    <Card class="space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 tracking-tight">7. Skeleton Loading Placeholder</h2>
      <div class="space-y-2.5">
        <Skeleton height="h-6" width="w-1/3" />
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-4/5" />
        <div class="flex gap-2 pt-2">
          <Skeleton height="h-9" width="w-24" rounded="rounded-xl" />
          <Skeleton height="h-9" width="w-24" rounded="rounded-xl" />
        </div>
      </div>
    </Card>
  </div>

  <!-- Section 6: Empty State -->
  <Card>
    <EmptyState
      title="Belum Ada Transaksi Tercatat"
      description="Tidak ditemukan riwayat kas kelas untuk saringan yang dipilih. Silakan ubah filter atau tambahkan transaksi baru."
      icon={Search}
    >
      <Button variant="primary" size="sm">
        Tambah Transaksi Baru
      </Button>
    </EmptyState>
  </Card>

  <!-- Section 7: Pagination -->
  <Card padding="p-0 overflow-hidden">
    <Pagination
      page={currentPage}
      totalPages={5}
      totalItems={48}
      pageSize={10}
      onchange={(newPage) => (currentPage = newPage)}
    />
  </Card>
</div>

<!-- Toast Container Global -->
<Toast />

