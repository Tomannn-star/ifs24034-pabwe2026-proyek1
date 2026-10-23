<script>
  /**
   * Komponen Input modern dan aksesibel
   * @type {{
   *   id?: string,
   *   label?: string,
   *   type?: string,
   *   value?: any,
   *   placeholder?: string,
   *   hint?: string,
   *   error?: string,
   *   required?: boolean,
   *   disabled?: boolean,
   *   prefix?: string,
   *   class?: string
   * }}
   */
  let {
    id = "input-" + Math.random().toString(36).substring(2, 9),
    label = "",
    type = "text",
    value = $bindable(""),
    placeholder = "",
    hint = "",
    error = "",
    required = false,
    disabled = false,
    prefix = "",
    class: customClass = "",
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
    {#if prefix}
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold select-none">
        {prefix}
      </span>
    {/if}

    <input
      {id}
      {type}
      bind:value
      {placeholder}
      {required}
      {disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      class="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition duration-150 focus:bg-white focus:outline-none focus-visible:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed {prefix ? 'pl-9' : ''} {error ? 'border-rose-400 focus-visible:ring-rose-400/20' : 'border-slate-200 focus:border-teal-700 focus-visible:ring-teal-700/20'} {customClass}"
      {...rest}
    />
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

