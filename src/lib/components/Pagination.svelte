<script>
  import Button from "./Button.svelte";

  /**
   * Komponen Pagination modern
   * @type {{
   *   page: number,
   *   totalPages: number,
   *   totalItems?: number,
   *   pageSize?: number,
   *   onchange: (page: number) => void
   * }}
   */
  let {
    page = 1,
    totalPages = 1,
    totalItems = 0,
    pageSize = 10,
    onchange
  } = $props();

  const startItem = $derived(((page - 1) * pageSize) + 1);
  const endItem = $derived(Math.min(page * pageSize, totalItems));
</script>

{#if totalPages > 1 || totalItems > 0}
  <div class="px-5 py-3.5 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
    <div>
      {#if totalItems > 0}
        Menampilkan <strong>{startItem}</strong>&ndash;<strong>{endItem}</strong> dari total <strong>{totalItems}</strong> data
      {:else}
        Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
      {/if}
    </div>

    <div class="flex items-center gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onclick={() => onchange(page - 1)}
      >
        &larr; Sebelumnya
      </Button>

      <span class="px-3 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs">
        {page} / {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onclick={() => onchange(page + 1)}
      >
        Selanjutnya &rarr;
      </Button>
    </div>
  </div>
{/if}

