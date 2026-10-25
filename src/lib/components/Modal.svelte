<script>
  import Button from "./Button.svelte";
  import { MODAL_VARIANTS } from "$lib/constants/index.js";
  import { X } from "lucide-svelte";

  /**
   * Komponen Modal konfirmasi & dialog interaktif modern dan aksesibel (WAI-ARIA Dialog).
   * Mendukung focus management, escape keydown, aria-labelledby, dan aria-describedby.
   *
   * @type {{
   *   open: boolean,
   *   title?: string,
   *   message?: string,
   *   confirmLabel?: string,
   *   cancelLabel?: string,
   *   confirmText?: string,
   *   cancelText?: string,
   *   variant?: 'primary' | 'danger' | 'warning',
   *   confirmVariant?: 'primary' | 'danger' | 'warning',
   *   loading?: boolean,
   *   onconfirm?: () => void,
   *   oncancel?: () => void,
   *   onclose?: () => void,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    open = $bindable(false),
    title = "Konfirmasi Tindakan",
    message = "",
    confirmLabel,
    cancelLabel,
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    variant = MODAL_VARIANTS.PRIMARY,
    confirmVariant,
    loading = false,
    onconfirm,
    oncancel,
    onclose,
    children
  } = $props();

  let effectiveConfirmLabel = $derived(confirmLabel || confirmText);
  let effectiveCancelLabel = $derived(cancelLabel || cancelText);
  let effectiveVariant = $derived(confirmVariant || variant);

  function handleClose() {
    if (loading) return;
    open = false;
    oncancel?.();
    onclose?.();
  }

  function handleConfirm() {
    onconfirm?.();
  }

  function handleKeydown(e) {
    if (e.key === "Escape" && open) {
      handleClose();
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop & Dialog Container -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-150"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-describedby={message ? "modal-description" : undefined}
    tabindex="-1"
    onclick={handleBackdropClick}
    onkeydown={(e) => { if (e.key === 'Escape') handleClose(); }}
  >
    <!-- Modal Card Box -->
    <div
      class="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200/80 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      role="document"
    >
      <div class="flex items-start justify-between gap-3">
        <h3 id="modal-title" class="font-extrabold text-lg text-slate-900 leading-snug">
          {title}
        </h3>
        <button
          onclick={handleClose}
          type="button"
          class="text-slate-600 hover:text-slate-900 p-1.5 -mr-1 -mt-1 rounded-lg transition hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600"
          aria-label="Tutup dialog {title}"
        >
          <X class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {#if message}
        <p id="modal-description" class="text-sm text-slate-600 leading-relaxed">
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
          {effectiveCancelLabel}
        </Button>
        <Button
          variant={effectiveVariant === MODAL_VARIANTS.DANGER ? "danger" : "primary"}
          size="md"
          onclick={handleConfirm}
          {loading}
        >
          {effectiveConfirmLabel}
        </Button>
      </div>
    </div>
  </div>
{/if}
