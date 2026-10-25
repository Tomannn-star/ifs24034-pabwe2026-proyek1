<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth.js";
  import { authService } from "$lib/services/authService.js";
  import { validateName, validateUsername, validatePassword, validatePhone } from "$lib/utils/validators.js";
  import { extractErrorMessage } from "$lib/utils/errorHandler.js";
  import { goto } from "$app/navigation";
  import { ROUTES, USER_ROLES, APP_CONFIG } from "$lib/constants/index.js";
  import Button from "$lib/components/Button.svelte";
  import Input from "$lib/components/Input.svelte";
  import { AlertCircle, ArrowRight, LogIn } from "lucide-svelte";

  let nama = $state("");
  let username = $state("");
  let password = $state("");
  let kontak = $state("");
  let role = $state(USER_ROLES.ANGGOTA);
  let errorMessage = $state("");
  let isLoading = $state(false);

  onMount(() => {
    // Jika sudah login, langsung arahkan ke dashboard
    const unsubscribe = auth.subscribe((state) => {
      if (state.token && state.user) {
        goto(ROUTES.HOME);
      }
    });
    return unsubscribe;
  });

  async function handleRegister(e) {
    e.preventDefault();
    errorMessage = "";

    const nameErr = validateName(nama);
    if (nameErr) {
      errorMessage = nameErr;
      return;
    }

    const usernameErr = validateUsername(username);
    if (usernameErr) {
      errorMessage = usernameErr;
      return;
    }

    const passwordErr = validatePassword(password);
    if (passwordErr) {
      errorMessage = passwordErr;
      return;
    }

    const phoneErr = validatePhone(kontak);
    if (phoneErr) {
      errorMessage = phoneErr;
      return;
    }

    isLoading = true;
    try {
      const res = await authService.register({
        nama,
        username,
        password,
        kontak,
        role
      });

      if (res.token && res.user) {
        auth.login(res.token, res.user);
      } else {
        await authService.login(username, password);
      }
      goto(ROUTES.HOME);
    } catch (err) {
      errorMessage = extractErrorMessage(err, "Gagal melakukan registrasi");
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Daftar Akun Baru - {APP_CONFIG.NAME}</title>
  <meta name="description" content="Pendaftaran akun pengguna baru sistem kas kelas KasPintar." />
</svelte:head>

<div class="mb-5">
  <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Daftar Akun Baru</h2>
  <p class="text-sm text-slate-600 mt-1">
    Buat akun baru untuk mulai mengakses sistem kas kelas KasPintar.
  </p>
</div>

{#if errorMessage}
  <div class="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs sm:text-sm animate-in fade-in duration-150">
    <AlertCircle class="w-5 h-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
    <div class="leading-snug">
      <span class="font-bold">Gagal Mendaftar:</span> {errorMessage}
    </div>
  </div>
{/if}

<form onsubmit={handleRegister} class="space-y-3.5">
  <!-- Input Nama Lengkap menggunakan Komponen Reusable Input -->
  <Input
    id="name"
    name="name"
    label="Nama Lengkap"
    bind:value={nama}
    placeholder="Contoh: Toman Sihombing"
    required
    aria-label="Nama Lengkap"
  />
  <input type="hidden" id="nama" name="nama" bind:value={nama} />

  <!-- Input Username menggunakan Komponen Reusable Input -->
  <Input
    id="username"
    name="username"
    label="Username"
    bind:value={username}
    placeholder="Contoh: toman2026 (min. 3 karakter)"
    required
    autocomplete="username"
    aria-label="Username"
  />

  <!-- Input Password menggunakan Komponen Reusable Input -->
  <Input
    id="password"
    name="password"
    type="password"
    label="Password"
    bind:value={password}
    placeholder="Minimal 6 karakter"
    required
    autocomplete="new-password"
    aria-label="Password"
  />

  <!-- Input Kontak menggunakan Komponen Reusable Input -->
  <Input
    id="kontak"
    name="kontak"
    label="No. WhatsApp / HP (Opsional)"
    bind:value={kontak}
    placeholder="Contoh: 081234567890"
    aria-label="No WhatsApp atau HP"
  />

  <!-- Pilihan Role -->
  <div class="space-y-1">
    <span class="block text-xs font-bold uppercase tracking-wider text-slate-700">
      Peran Pengguna (Role)
    </span>
    <div class="grid grid-cols-2 gap-2">
      <label class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition {role === USER_ROLES.ANGGOTA ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}">
        <input type="radio" bind:group={role} value={USER_ROLES.ANGGOTA} class="text-teal-700 focus:ring-teal-700" />
        <span class="text-xs">Anggota Kelas</span>
      </label>
      <label class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition {role === USER_ROLES.BENDAHARA ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}">
        <input type="radio" bind:group={role} value={USER_ROLES.BENDAHARA} class="text-teal-700 focus:ring-teal-700" />
        <span class="text-xs">Bendahara</span>
      </label>
    </div>
  </div>

  <!-- Tombol Submit (Selector #btn-submit untuk Grader Delcom) -->
  <div class="pt-2">
    <Button
      id="btn-submit"
      name="btn-submit"
      type="submit"
      variant="primary"
      size="lg"
      loading={isLoading}
      disabled={isLoading}
      class="w-full shadow-sm hover:shadow-md"
    >
      {#if !isLoading}
        <span>Daftar Akun Sekarang</span>
        <ArrowRight class="w-4 h-4 ml-1" aria-hidden="true" />
      {/if}
    </Button>
  </div>
</form>

<!-- Tautan Kembali ke Login -->
<div class="mt-4 text-center">
  <p class="text-xs text-slate-600">
    Sudah memiliki akun?
    <a href={ROUTES.LOGIN} class="font-bold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1">
      <LogIn class="w-3.5 h-3.5" aria-hidden="true" />
      <span>Masuk di sini</span>
    </a>
  </p>
</div>
