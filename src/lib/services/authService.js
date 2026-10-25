/**
 * @fileoverview Service Autentikasi Pengguna KasPintar
 * Menangani komunikasi API untuk pendaftaran akun baru, login,
 * serta verifikasi sesi pengguna.
 */

import { api } from "../api.js";
import { auth } from "../stores/auth.js";

export const authService = {
  /**
   * Melakukan autentikasi masuk ke server.
   * 
   * @param {string} username - Nama pengguna
   * @param {string} password - Kata sandi akun
   * @returns {Promise<{ user: any, token: string, message: string }>}
   */
  async login(username, password) {
    const res = await api.post("auth/login", {
      username: username.trim(),
      password
    });
    if (res.token && res.user) {
      auth.login(res.token, res.user);
    }
    return res;
  },

  /**
   * Mendaftarkan akun anggota / pengguna baru.
   * 
   * @param {Object} payload
   * @param {string} payload.nama
   * @param {string} payload.username
   * @param {string} payload.password
   * @param {string} [payload.kontak]
   * @param {string} [payload.role]
   * @returns {Promise<{ message: string, user: any }>}
   */
  async register(payload) {
    return await api.post("auth/register", {
      nama: payload.nama.trim(),
      username: payload.username.trim(),
      password: payload.password,
      kontak: payload.kontak?.trim() || null,
      role: payload.role || "anggota"
    });
  },

  /**
   * Mengambil profil pengguna yang sedang login.
   * 
   * @returns {Promise<{ user: any }>}
   */
  async getProfile() {
    return await api.get("auth/me");
  },

  /**
   * Melakukan logout dan menghapus sesi lokal.
   * 
   * @param {boolean} [redirect=true]
   */
  logout(redirect = true) {
    auth.logout(redirect);
  }
};
