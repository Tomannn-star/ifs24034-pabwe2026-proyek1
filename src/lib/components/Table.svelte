<script>
  /**
   * Komponen Table wrapper responsif
   * @type {{
   *   class?: string,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    class: customClass = "",
    children,
    ...rest
  } = $props();
</script>

<div class="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden {customClass}" {...rest}>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm text-slate-600 border-collapse">
      {@render children?.()}
    </table>
  </div>
</div>

