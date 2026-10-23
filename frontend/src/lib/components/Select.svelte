<script>
  /**
   * Komponen Select dropdown modern
   * @type {{
   *   id?: string,
   *   label?: string,
   *   value?: any,
   *   hint?: string,
   *   error?: string,
   *   required?: boolean,
   *   disabled?: boolean,
   *   class?: string,
   *   onchange?: (e: Event) => void,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    id = "select-" + Math.random().toString(36).substring(2, 9),
    label = "",
    value = $bindable(""),
    hint = "",
    error = "",
    required = false,
    disabled = false,
    class: customClass = "",
    onchange,
    children,
    ...rest
  } = $props();
</script>

<div class="space-y-1.5 w-full">
  {#if label}
    <label for={id} class="block text-xs font-bold uppercase tracking-wider text-slate-700">
      {label}
      {#if required}
        <span class="text-rose-500 font-bold" title="Wajib diisi">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative">
    <select
      {id}
      bind:value
      {required}
      {disabled}
      {onchange}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      class="w-full appearance-none px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border rounded-xl text-sm text-slate-900 transition duration-150 focus:bg-white focus:outline-none focus-visible:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed pr-10 {error ? 'border-rose-400 focus-visible:ring-rose-400/20' : 'border-slate-200 focus:border-teal-700 focus-visible:ring-teal-700/20'} {customClass}"
      {...rest}
    >
      {@render children?.()}
    </select>

    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  {#if error}
    <p id="{id}-error" class="text-xs text-rose-600 font-medium flex items-center gap-1">
      <span>•</span> {error}
    </p>
  {:else if hint}
    <p id="{id}-hint" class="text-xs text-slate-500">
      {hint}
    </p>
  {/if}
</div>

