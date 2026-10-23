<script>
  /**
   * Komponen Card serbaguna
   * @type {{
   *   class?: string,
   *   padding?: string,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    class: customClass = "",
    padding = "p-6",
    children,
    ...rest
  } = $props();
</script>

<div
  class="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] transition-shadow duration-150 {padding} {customClass}"
  {...rest}
>
  {@render children?.()}
</div>

