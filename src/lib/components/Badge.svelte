<script>
  import { BADGE_VARIANTS } from "$lib/constants/index.js";

  /**
   * Komponen Badge status modern
   * Mendukung seluruh varian status finansial dan peran pengguna secara lengkap.
   * 
   * @type {{
   *   variant?: 'success' | 'danger' | 'warning' | 'amber' | 'info' | 'primary' | 'neutral',
   *   size?: 'sm' | 'md',
   *   dot?: boolean,
   *   class?: string,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    variant = BADGE_VARIANTS.NEUTRAL,
    size = "md",
    dot = false,
    class: customClass = "",
    children,
    ...rest
  } = $props();

  const variantClasses = {
    [BADGE_VARIANTS.SUCCESS]: "bg-teal-50 text-teal-800 border-teal-200/80",
    [BADGE_VARIANTS.DANGER]: "bg-rose-50 text-rose-800 border-rose-200/80",
    [BADGE_VARIANTS.WARNING]: "bg-amber-50 text-amber-800 border-amber-200/80",
    [BADGE_VARIANTS.AMBER]: "bg-amber-50 text-amber-800 border-amber-200/80",
    [BADGE_VARIANTS.INFO]: "bg-sky-50 text-sky-800 border-sky-200/80",
    [BADGE_VARIANTS.PRIMARY]: "bg-teal-50 text-teal-900 border-teal-300",
    [BADGE_VARIANTS.NEUTRAL]: "bg-slate-100 text-slate-700 border-slate-200/80"
  };

  const dotClasses = {
    [BADGE_VARIANTS.SUCCESS]: "bg-teal-500",
    [BADGE_VARIANTS.DANGER]: "bg-rose-500",
    [BADGE_VARIANTS.WARNING]: "bg-amber-500",
    [BADGE_VARIANTS.AMBER]: "bg-amber-500",
    [BADGE_VARIANTS.INFO]: "bg-sky-500",
    [BADGE_VARIANTS.PRIMARY]: "bg-teal-700",
    [BADGE_VARIANTS.NEUTRAL]: "bg-slate-400"
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs"
  };
</script>

<span
  class="inline-flex items-center gap-1.5 font-semibold rounded-full border transition-colors {variantClasses[variant] || variantClasses[BADGE_VARIANTS.NEUTRAL]} {sizeClasses[size] || sizeClasses.md} {customClass}"
  {...rest}
>
  {#if dot}
    <span class="w-1.5 h-1.5 rounded-full shrink-0 {dotClasses[variant] || dotClasses[BADGE_VARIANTS.NEUTRAL]}"></span>
  {/if}
  {@render children?.()}
</span>
