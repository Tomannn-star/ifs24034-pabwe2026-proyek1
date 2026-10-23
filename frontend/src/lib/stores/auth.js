import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { goto } from "$app/navigation";

function createAuthStore() {
  const initialToken = browser ? localStorage.getItem("kaspintar_token") : null;
  let initialUser = null;

  if (browser && localStorage.getItem("kaspintar_user")) {
    try {
      initialUser = JSON.parse(localStorage.getItem("kaspintar_user"));
    } catch (e) {
      initialUser = null;
    }
  }

  const { subscribe, set, update } = writable({
    token: initialToken,
    user: initialUser,
    isLoaded: false
  });

  return {
    subscribe,
    login(token, user) {
      if (browser) {
        localStorage.setItem("kaspintar_token", token);
        localStorage.setItem("kaspintar_user", JSON.stringify(user));
      }
      set({ token, user, isLoaded: true });
    },
    logout(redirect = true) {
      if (browser) {
        localStorage.removeItem("kaspintar_token");
        localStorage.removeItem("kaspintar_user");
      }
      set({ token: null, user: null, isLoaded: true });
      if (redirect && browser) {
        goto("/login");
      }
    },
    updateUser(user) {
      if (browser) {
        localStorage.setItem("kaspintar_user", JSON.stringify(user));
      }
      update((state) => ({ ...state, user }));
    },
    markLoaded() {
      update((state) => ({ ...state, isLoaded: true }));
    }
  };
}

export const auth = createAuthStore();

