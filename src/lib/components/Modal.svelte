<script>
  import Button from "./Button.svelte";

  /**
   * Komponen Modal konfirmasi
   * @type {{
   *   open: boolean,
   *   title: string,
   *   message?: string,
   *   confirmLabel?: string,
   *   cancelLabel?: string,
   *   variant?: 'danger' | 'primary',
   *   loading?: boolean,
   *   onconfirm?: () => void,
   *   oncancel?: () => void,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    open = $bindable(false),
    title = "Konfirmasi",
    message = "",
    confirmLabel = "Ya, Lanjutkan",
    cancelLabel = "Batal",
    variant = "primary",
    loading = false,
    onconfirm,
    oncancel,
    children
  } = $props();

  function handleClose() {
    if (loading) return;
    open = false;
    oncancel?.();
  }

  function handleConfirm() {
    onconfirm?.();
  }

  function handleKeydown(e) {
    if (e.key === "Escape" && open) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-150"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Modal Card -->
    <div
      class="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200/80 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
    >
      <div class="flex items-start justify-between gap-3">
        <h3 id="modal-title" class="font-extrabold text-lg text-slate-900 leading-snug">
          {title}
        </h3>
        <button
          onclick={handleClose}
          type="button"
          class="text-slate-600 hover:text-slate-800 p-1 -mr-1 -mt-1 rounded-lg text-lg leading-none transition"
          aria-label="Tutup Dialog"
        >
          &times;
        </button>
      </div>

      {#if message}
        <p class="text-sm text-slate-600 leading-relaxed">
          {message}
        </p>
      {/if}

      {@render children?.()}

      <div class="pt-2 flex items-center justify-end gap-2.5">
        <Button
          variant="secondary"
          size="md"
          onclick={handleClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "danger" ? "danger" : "primary"}
          size="md"
          onclick={handleConfirm}
          {loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </div>
{/if}

