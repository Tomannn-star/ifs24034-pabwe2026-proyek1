/**
 * @fileoverview Service Manajemen Token dan Sesi KasPintar
 * Menyediakan abstraksi penyimpanan token sesi menggunakan kombinasi Cookie dan Storage klien.
 * Memungkinkan sinkronisasi kredensial ke Server-Side Guard via Cookie dan persistensi klien,
 * dilengkapi dengan pemeriksaan validitas dan kadaluarsa JWT (expiration verification).
 */

import { APP_CONFIG } from "../constants/index.js";
import { getCookie, setCookie, removeCookie } from "../utils/cookies.js";

function isClientEnvironment() {
  return typeof globalThis.window !== "undefined" && typeof globalThis.document !== "undefined";
}

export class TokenService {
  /** @type {string|null} */
  #token = null;
  /** @type {any|null} */
  #user = null;

  constructor() {
    this.init();
  }

  /**
   * Inisialisasi pembacaan sesi awal dari penyimpanan browser
   */
  init() {
    if (isClientEnvironment()) {
      let token = getCookie(APP_CONFIG.STORAGE_KEYS.TOKEN);
      if (!token && typeof localStorage !== "undefined") {
        token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
      }

      if (token && this.isTokenExpired(token)) {
        this.clearSession();
        return;
      }
      this.#token = token || null;

      let rawUser = getCookie(APP_CONFIG.STORAGE_KEYS.USER);
      if (!rawUser && typeof localStorage !== "undefined") {
        rawUser = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
      }
      if (rawUser) {
        try {
          this.#user = JSON.parse(rawUser);
        } catch {
          this.#user = null;
        }
      }
    }
  }

  /**
   * Mengurai payload JWT secara aman
   * @param {string} token
   * @returns {Object|null}
   */
  decodePayload(token) {
    if (!token || typeof token !== "string") return null;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replaceAll("-", "+").replaceAll("_", "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.codePointAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Memeriksa apakah token JWT telah kadaluarsa
   * @param {string} [token]
   * @returns {boolean}
   */
  isTokenExpired(token = null) {
    const targetToken = token || this.#token;
    if (!targetToken) return true;
    const payload = this.decodePayload(targetToken);
    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
  }

  /**
   * Mendapatkan token autentikasi saat ini
   * Membersihkan sesi otomatis apabila token telah kadaluarsa
   * @returns {string|null}
   */
  getToken() {
    let token = this.#token;
    if (!token && isClientEnvironment()) {
      token = getCookie(APP_CONFIG.STORAGE_KEYS.TOKEN);
      if (!token && typeof localStorage !== "undefined") {
        token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
      }
    }
    if (token && this.isTokenExpired(token)) {
      this.clearSession();
      return null;
    }
    this.#token = token || null;
    return this.#token;
  }

  /**
   * Mendapatkan data profil pengguna saat ini
   * @returns {any|null}
   */
  getUser() {
    if (this.#token && this.isTokenExpired(this.#token)) {
      this.clearSession();
      return null;
    }
    if (this.#user) return this.#user;
    if (isClientEnvironment()) {
      let raw = getCookie(APP_CONFIG.STORAGE_KEYS.USER);
      if (!raw && typeof localStorage !== "undefined") {
        raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
      }
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Memeriksa apakah pengguna memiliki peran tertentu
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    const user = this.getUser();
    return Boolean(user?.role === role);
  }

  /**
   * Memeriksa apakah sesi saat ini terautentikasi aktif
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(this.getToken() && this.getUser());
  }

  /**
   * Menyimpan token dan data pengguna baru ke dalam Cookie & Storage
   * @param {string} token - JWT Token
   * @param {Object} user - Objek data pengguna
   */
  setSession(token, user) {
    this.#token = token;
    this.#user = user;

    if (isClientEnvironment()) {
      const serializedUser = JSON.stringify(user);
      // Simpan ke cookie dengan SameSite dan Secure
      setCookie(APP_CONFIG.STORAGE_KEYS.TOKEN, token, 7);
      setCookie(APP_CONFIG.STORAGE_KEYS.USER, serializedUser, 7);

      // Sinkronkan ke localStorage sebagai fallback
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, serializedUser);
      }
    }
  }

  /**
   * Memperbarui informasi profil pengguna aktif
   * @param {Object} user
   */
  setUser(user) {
    this.#user = user;
    if (isClientEnvironment()) {
      const serializedUser = JSON.stringify(user);
      setCookie(APP_CONFIG.STORAGE_KEYS.USER, serializedUser, 7);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, serializedUser);
      }
    }
  }

  /**
   * Menghapus seluruh sesi autentikasi dari Cookie dan Storage
   */
  clearSession() {
    this.#token = null;
    this.#user = null;

    if (isClientEnvironment()) {
      removeCookie(APP_CONFIG.STORAGE_KEYS.TOKEN);
      removeCookie(APP_CONFIG.STORAGE_KEYS.USER);
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
      }
    }
  }
}

export const tokenService = new TokenService();
