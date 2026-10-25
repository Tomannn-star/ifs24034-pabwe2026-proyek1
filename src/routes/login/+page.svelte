<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  onMount(() => {
    goto("/auth/login", { replaceState: true });
  });
</script>

<svelte:head>
  <title>Mengarahkan ke /auth/login - KasPintar</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex items-center justify-center">
  <div class="text-center p-6">
    <div class="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-sm font-medium text-slate-600">Mengarahkan ke halaman masuk...</p>
    <a href="/auth/login" class="text-xs text-teal-700 hover:underline mt-2 inline-block">
      Klik di sini jika tidak diarahkan otomatis
    </a>
  </div>
</div>
