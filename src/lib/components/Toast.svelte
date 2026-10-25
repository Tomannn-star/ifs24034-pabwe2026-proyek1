<script>
  import { toast } from "$lib/stores/toast.js";

  let toasts = $state([]);

  $effect(() => {
    const unsub = toast.subscribe((val) => (toasts = val));
    return unsub;
  });

  const typeStyles = {
    success: "bg-teal-900/95 text-white border-teal-700/60",
    error: "bg-rose-950/95 text-white border-rose-800/60",
    info: "bg-slate-900/95 text-white border-slate-700/60"
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ"
  };
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0" role="region" aria-label="Notifikasi">
  {#each toasts as t (t.id)}
    <div
      class="pointer-events-auto p-3.5 rounded-2xl border shadow-lg backdrop-blur-md flex items-center justify-between gap-3 text-sm animate-in slide-in-from-bottom-2 fade-in duration-150 {typeStyles[t.type] || typeStyles.info}"
      role="alert"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
          {icons[t.type] || "•"}
        </span>
        <span class="font-medium text-xs sm:text-sm leading-snug">{t.message}</span>
      </div>
      <button
        type="button"
        onclick={() => toast.dismiss(t.id)}
        class="text-white/60 hover:text-white p-1 rounded-lg text-base leading-none transition"
        aria-label="Tutup Notifikasi"
      >
        &times;
      </button>
    </div>
  {/each}
</div>

