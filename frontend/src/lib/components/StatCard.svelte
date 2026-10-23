<script>
  /**
   * Komponen StatCard gaya dashboard fintech
   * @type {{
   *   title: string,
   *   value: string | number,
   *   subtext?: string,
   *   variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral',
   *   icon?: any,
   *   class?: string
   * }}
   */
  let {
    title,
    value,
    subtext = "",
    variant = "primary",
    icon: IconComponent = null,
    class: customClass = ""
  } = $props();

  const variantStyles = {
    primary: {
      card: "border-slate-200/80 hover:border-teal-300",
      iconBg: "bg-teal-50 text-teal-700 border-teal-100",
      valText: "text-teal-700",
      dot: "bg-teal-500"
    },
    success: {
      card: "border-slate-200/80 hover:border-emerald-300",
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      valText: "text-emerald-700",
      dot: "bg-emerald-500"
    },
    danger: {
      card: "border-slate-200/80 hover:border-rose-300",
      iconBg: "bg-rose-50 text-rose-700 border-rose-100",
      valText: "text-rose-600",
      dot: "bg-rose-500"
    },
    warning: {
      card: "border-slate-200/80 hover:border-amber-300",
      iconBg: "bg-amber-50 text-amber-700 border-amber-100",
      valText: "text-amber-700",
      dot: "bg-amber-500"
    },
    neutral: {
      card: "border-slate-200/80 hover:border-slate-300",
      iconBg: "bg-slate-100 text-slate-700 border-slate-200",
      valText: "text-slate-800",
      dot: "bg-slate-400"
    }
  };

  const style = $derived(variantStyles[variant] || variantStyles.primary);
</script>

<div
  class="bg-white rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-150 {style.card} {customClass}"
>
  <div class="flex items-center justify-between">
    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
    {#if IconComponent}
      <div class="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 {style.iconBg}">
        <IconComponent class="w-5 h-5" />
      </div>
    {/if}
  </div>

  <div class="mt-3">
    <div class="text-3xl font-extrabold tracking-tight tabular-nums {style.valText}">
      {value}
    </div>
    {#if subtext}
      <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
        <span class="w-1.5 h-1.5 rounded-full shrink-0 {style.dot}"></span>
        <span>{subtext}</span>
      </div>
    {/if}
  </div>
</div>

