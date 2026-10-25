/**
 * @fileoverview Utilitas Validasi Input & Sanitasi Keamanan KasPintar
 * Menyediakan fungsi-fungsi validasi murni untuk memverifikasi input formulir
 * sebelum dikirimkan ke server backend guna memastikan integritas data dan keamanan dasar.
 */

import { APP_CONFIG } from "../constants/index.js";

/**
 * Sanitasi string input untuk mencegah serangan injeksi dan XSS dasar.
 * Menghapus tag HTML dan spasi berlebih.
 * 
 * @param {string} input - Teks mentah dari input pengguna
 * @returns {string} Teks yang telah disanitasi
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input
    .replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[m])
    .trim();
}

/**
 * Validasi nama lengkap.
 * 
 * @param {string} name - Nama yang diinputkan
 * @returns {string|null} Pesan error jika tidak valid, atau null jika valid
 */
export function validateName(name) {
  if (!name || typeof name !== "string" || name.trim() === "") {
    return "Nama lengkap wajib diisi";
  }
  const clean = name.trim();
  if (clean.length < 2) {
    return "Nama lengkap minimal 2 karakter";
  }
  if (clean.length > 100) {
    return "Nama lengkap maksimal 100 karakter";
  }
  return null;
}

/**
 * Validasi username (hanya huruf, angka, dan underscore, min 3 karakter).
 * 
 * @param {string} username - Username yang diinputkan
 * @returns {string|null} Pesan error jika tidak valid, atau null jika valid
 */
export function validateUsername(username) {
  if (!username || typeof username !== "string" || username.trim() === "") {
    return "Username wajib diisi";
  }
  const clean = username.trim();
  if (clean.length < APP_CONFIG.MIN_USERNAME_LENGTH) {
    return `Username minimal ${APP_CONFIG.MIN_USERNAME_LENGTH} karakter`;
  }
  if (clean.length > 30) {
    return "Username maksimal 30 karakter";
  }
  const usernameRegex = /^\w+$/;
  if (!usernameRegex.test(clean)) {
    return "Username hanya boleh memuat huruf, angka, dan garis bawah (_)";
  }
  return null;
}

/**
 * Validasi kata sandi / password (minimal 6 karakter).
 * 
 * @param {string} password - Password yang diinputkan
 * @returns {string|null} Pesan error jika tidak valid, atau null jika valid
 */
export function validatePassword(password) {
  if (!password || typeof password !== "string" || password === "") {
    return "Password wajib diisi";
  }
  if (password.length < APP_CONFIG.MIN_PASSWORD_LENGTH) {
    return `Password minimal ${APP_CONFIG.MIN_PASSWORD_LENGTH} karakter`;
  }
  if (password.length > 100) {
    return "Password maksimal 100 karakter";
  }
  return null;
}

/**
 * Validasi nominal uang (harus berupa angka positif utuh).
 * 
 * @param {number|string} amount - Nominal transaksi atau iuran
 * @param {number} [min=1] - Batas nominal minimum
 * @returns {string|null} Pesan error jika tidak valid, atau null jika valid
 */
export function validateNominal(amount, min = 1) {
  if (amount === undefined || amount === null || amount === "") {
    return "Nominal uang wajib diisi";
  }
  const num = Number(amount);
  if (Number.isNaN(num)) {
    return "Nominal harus berupa angka valid";
  }
  if (num < min) {
    return `Nominal minimal adalah Rp ${min.toLocaleString("id-ID")}`;
  }
  if (!Number.isInteger(num)) {
    return "Nominal uang harus berupa angka bulat tanpa desimal";
  }
  return null;
}

/**
 * Validasi nomor kontak / WhatsApp (opsional, jika diisi harus berformat nomor telepon Indonesia).
 * 
 * @param {string} phone - Nomor telepon
 * @returns {string|null} Pesan error jika tidak valid, atau null jika valid
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    return null; // Opsional
  }
  const clean = phone.trim().replaceAll(/[-\s]/g, "");
  const phoneRegex = /^(\+62|62|0)\d{8,14}$/;
  if (!phoneRegex.test(clean)) {
    return "Format nomor WhatsApp tidak valid (contoh: 081234567890)";
  }
  return null;
}

/**
 * Validasi teks keterangan transaksi atau catatan.
 * 
 * @param {string} text - Teks keterangan
 * @param {boolean} [required=true] - Apakah wajib diisi
 * @returns {string|null} Pesan error jika tidak valid, atau null jika valid
 */
export function validateKeterangan(text, required = true) {
  if (!text || typeof text !== "string" || text.trim() === "") {
    return required ? "Keterangan wajib diisi" : null;
  }
  const clean = text.trim();
  if (clean.length < 3) {
    return "Keterangan minimal 3 karakter";
  }
  if (clean.length > 255) {
    return "Keterangan maksimal 255 karakter";
  }
  return null;
}

/**
 * Validasi format tanggal YYYY-MM-DD.
 * 
 * @param {string} dateStr - String tanggal
 * @returns {string|null} Pesan error jika tidak valid, atau null jika valid
 */
export function validateTanggal(dateStr) {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
    return "Tanggal wajib dipilih";
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr.trim())) {
    return "Format tanggal tidak valid (harus YYYY-MM-DD)";
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return "Tanggal kalender tidak valid";
  }
  return null;
}
