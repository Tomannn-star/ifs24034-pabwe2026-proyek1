/**
 * @fileoverview Utilitas Cookie Klien KasPintar
 * Menyediakan fungsi helper untuk menyimpan, membaca, dan menghapus cookie autentikasi
 * secara aman dengan atribut SameSite, Secure, dan Path.
 */

/**
 * Menyimpan cookie pada browser
 * @param {string} name - Nama cookie
 * @param {string} value - Nilai cookie
 * @param {number} [days=7] - Durasi masa berlaku dalam hari
 */
export function setCookie(name, value, days = 7) {
  if (globalThis.document === undefined) return;
  const maxAge = days * 24 * 60 * 60;
  const secure = globalThis.window?.location?.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * Membaca nilai cookie berdasarkan nama
 * @param {string} name - Nama cookie
 * @returns {string|null} Nilai cookie atau null jika tidak ditemukan
 */
export function getCookie(name) {
  if (globalThis.document === undefined) return null;
  const target = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";");
  for (const rawPart of parts) {
    const part = rawPart.trim();
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
  if (globalThis.document === undefined) return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}
