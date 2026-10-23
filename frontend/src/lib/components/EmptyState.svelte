<script>
  /**
   * Komponen EmptyState elegan
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

<div class="py-12 px-4 text-center max-w-sm mx-auto flex flex-col items-center justify-center">
  {#if IconComponent}
    <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3.5 border border-slate-200/60 shadow-2xs">
      <IconComponent class="w-7 h-7 stroke-[1.5]" />
    </div>
  {/if}

  <h3 class="font-extrabold text-slate-900 text-base tracking-tight">
    {title}
  </h3>

  {#if description}
    <p class="text-xs text-slate-500 mt-1 leading-relaxed">
      {description}
    </p>
  {/if}

  {#if children}
    <div class="mt-4 flex items-center justify-center gap-2">
      {@render children()}
    </div>
  {/if}
</div>

