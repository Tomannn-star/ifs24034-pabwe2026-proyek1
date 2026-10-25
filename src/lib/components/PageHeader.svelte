<script>
  /**
   * Komponen Header halaman
   * @type {{
   *   title: string,
   *   description?: string,
   *   icon?: any,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    title,
    description = "",
    icon: IconComponent = null,
    children
  } = $props();
</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
  <div>
    <div class="flex items-center gap-2.5">
      {#if IconComponent}
        <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
          <IconComponent class="w-4 h-4" />
        </div>
      {/if}
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
    </div>
    {#if description}
      <p class="text-slate-600 text-xs sm:text-sm mt-1">
        {description}
      </p>
    {/if}
  </div>

  {#if children}
    <div class="flex items-center gap-2.5 shrink-0">
      {@render children()}
    </div>
  {/if}
</div>

