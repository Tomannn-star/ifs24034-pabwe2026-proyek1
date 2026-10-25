import { writable } from "svelte/store";

function createToastStore() {
  const { subscribe, update } = writable([]);

  function add(message, type = "info", duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    update((toasts) => [...toasts, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
    return id;
  }

  function dismiss(id) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    success: (msg, duration) => add(msg, "success", duration),
    error: (msg, duration) => add(msg, "error", duration),
    info: (msg, duration) => add(msg, "info", duration),
    dismiss
  };
}

export const toast = createToastStore();

