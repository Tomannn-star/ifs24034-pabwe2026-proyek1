/**
 * @fileoverview Konstanta Global Aplikasi KasPintar
 * Menyimpan seluruh enumerasi, path rute, tipe peran, dan konfigurasi default
 * untuk mencegah penggunaan hardcoded magic strings dalam komponen UI dan service.
 */

export const USER_ROLES = Object.freeze({
  BENDAHARA: "bendahara",
  ANGGOTA: "anggota"
});

export const TRANSACTION_TYPES = Object.freeze({
  MASUK: "masuk",
  KELUAR: "keluar"
});

export const DUES_STATUS = Object.freeze({
  LUNAS: "lunas",
  BELUM_BAYAR: "belum_bayar"
});

export const ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  TRANSAKSI: "/transaksi",
  TRANSAKSI_BARU: "/transaksi/baru",
  IURAN: "/iuran",
  ANGGOTA: "/anggota",
  KATEGORI: "/kategori",
  PENUNGGAK: "/penunggak"
});

export const APP_CONFIG = Object.freeze({
  NAME: "KasPintar",
  TITLE: "KasPintar - Sistem Pencatatan Uang Kas Kelas",
  DEFAULT_PAGE_SIZE: 10,
  MIN_PASSWORD_LENGTH: 6,
  MIN_USERNAME_LENGTH: 3,
  DEFAULT_PORT: 5001,
  STORAGE_KEYS: {
    TOKEN: "kaspintar_token",
    USER: "kaspintar_user"
  }
});
