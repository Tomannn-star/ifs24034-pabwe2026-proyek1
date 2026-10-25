/**
 * @fileoverview Utilitas Cookie Klien KasPintar
 * Menyediakan fungsi helper untuk menyimpan, membaca, dan menghapus cookie autentikasi
 * secara aman dengan atribut SameSite, Secure, dan Path.
 */

const isBrowser = typeof document !== "undefined";

/**
 * Menyimpan cookie pada browser
 * @param {string} name - Nama cookie
 * @param {string} value - Nilai cookie
 * @param {number} [days=7] - Durasi masa berlaku dalam hari
 */
export function setCookie(name, value, days = 7) {
  if (!isBrowser) return;
  const maxAge = days * 24 * 60 * 60;
  const secure = typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * Membaca nilai cookie berdasarkan nama
 * @param {string} name - Nama cookie
 * @returns {string|null} Nilai cookie atau null jika tidak ditemukan
 */
export function getCookie(name) {
  if (!isBrowser) return null;
  const target = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";");
  for (let part of parts) {
    part = part.trim();
    if (part.startsWith(target)) {
      return decodeURIComponent(part.substring(target.length));
    }
  }
  return null;
}

/**
 * Menghapus cookie dari browser
 * @param {string} name - Nama cookie yang akan dihapus
 */
export function removeCookie(name) {
  if (!isBrowser) return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

