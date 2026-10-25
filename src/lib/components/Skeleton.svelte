<script>
  /**
   * Komponen Skeleton loading
   * @type {{
   *   class?: string,
   *   height?: string,
   *   width?: string,
   *   rounded?: string
   * }}
   */
  let {
    class: customClass = "",
    height = "h-4",
    width = "w-full",
    rounded = "rounded-lg"
  } = $props();
</script>

<div
  class="animate-pulse bg-slate-200/80 {height} {width} {rounded} {customClass}"
  aria-hidden="true"
></div>

