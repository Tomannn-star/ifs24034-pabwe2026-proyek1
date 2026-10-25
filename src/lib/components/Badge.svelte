<script>
  /**
   * Komponen Badge modern
   * @type {{
   *   variant?: 'success' | 'danger' | 'warning' | 'neutral' | 'info',
   *   size?: 'sm' | 'md',
   *   dot?: boolean,
   *   class?: string,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    variant = "neutral",
    size = "md",
    dot = false,
    class: customClass = "",
    children,
    ...rest
  } = $props();

  const variantClasses = {
    success: "bg-teal-50 text-teal-800 border-teal-200/80",
    danger: "bg-rose-50 text-rose-800 border-rose-200/80",
    warning: "bg-amber-50 text-amber-800 border-amber-200/80",
    info: "bg-sky-50 text-sky-800 border-sky-200/80",
    neutral: "bg-slate-100 text-slate-700 border-slate-200/80"
  };

  const dotClasses = {
    success: "bg-teal-500",
    danger: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
    neutral: "bg-slate-400"
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs"
  };
</script>

<span
  class="inline-flex items-center gap-1.5 font-semibold rounded-full border transition-colors {variantClasses[variant] || variantClasses.neutral} {sizeClasses[size] || sizeClasses.md} {customClass}"
  {...rest}
>
  {#if dot}
    <span class="w-1.5 h-1.5 rounded-full shrink-0 {dotClasses[variant] || dotClasses.neutral}"></span>
  {/if}
  {@render children?.()}
</span>

