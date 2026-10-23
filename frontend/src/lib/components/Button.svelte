<script>
  /**
   * Komponen Button modern fintech
   * @type {{
   *   variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
   *   size?: 'sm' | 'md' | 'lg',
   *   type?: 'button' | 'submit' | 'reset',
   *   loading?: boolean,
   *   disabled?: boolean,
   *   class?: string,
   *   onclick?: (e: MouseEvent) => void,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    variant = "primary",
    size = "md",
    type = "button",
    loading = false,
    disabled = false,
    class: customClass = "",
    onclick,
    children,
    ...rest
  } = $props();

  const variantClasses = {
    primary: "bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white shadow-xs focus-visible:ring-teal-600",
    secondary: "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs focus-visible:ring-slate-400",
    danger: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus-visible:ring-rose-500",
    ghost: "bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-5 py-2.5 text-base rounded-xl gap-2.5"
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  {onclick}
  class="inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 {variantClasses[variant] || variantClasses.primary} {sizeClasses[size] || sizeClasses.md} {customClass}"
  {...rest}
>
  {#if loading}
    <svg class="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
  {/if}
  {@render children?.()}
</button>

