/**
 * @fileoverview Store Status Autentikasi Reaktif KasPintar
 * Menyimpan token JWT dan profil pengguna aktif secara reaktif menggunakan Svelte Store.
 * Terintegrasi penuh dengan tokenService untuk sinkronisasi Cookie dan Storage.
 */

import { writable } from "svelte/store";
import { tokenService } from "../services/tokenService.js";
import { ROUTES } from "../constants/index.js";

export function navigateToLogin() {
  if (typeof globalThis.window === "undefined") return;
  if (globalThis.window.location && globalThis.window.location.pathname !== ROUTES.LOGIN) {
    globalThis.window.location.href = ROUTES.LOGIN;
  }
}

function createAuthStore() {
  const initialToken = tokenService.getToken();
  const initialUser = tokenService.getUser();

  const { subscribe, set, update } = writable({
    token: initialToken,
    user: initialUser,
    isLoaded: false
  });

  return {
    subscribe,

    /**
     * Menyimpan sesi login ke tokenService dan memperbarui state store
     * @param {string} token
     * @param {Object} user
     */
    login(token, user) {
      tokenService.setSession(token, user);
      set({ token, user, isLoaded: true });
    },

    /**
     * Menghapus sesi dan mengarahkan kembali ke halaman login
     * @param {boolean} [redirect=true]
     */
    logout(redirect = true) {
      tokenService.clearSession();
      set({ token: null, user: null, isLoaded: true });
      if (redirect) {
        navigateToLogin();
      }
    },

    /**
     * Memperbarui data pengguna tanpa mengganti token
     * @param {Object} user
     */
    updateUser(user) {
      tokenService.setUser(user);
      update((state) => ({ ...state, user }));
    },

    /**
     * Menandai inisialisasi sesi store telah selesai
     */
    markLoaded() {
      update((state) => ({ ...state, isLoaded: true }));
    }
  };
}

export const auth = createAuthStore();
