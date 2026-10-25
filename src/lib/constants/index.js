/**
 * @fileoverview Konstanta Global Aplikasi KasPintar
 * Menyimpan seluruh enumerasi, path rute, tipe peran, dan konfigurasi default
 * untuk mencegah penggunaan hardcoded magic strings dalam komponen UI, service, dan guard.
 */

/**
 * Peran pengguna dalam sistem KasPintar
 * @readonly
 * @enum {string}
 */
export const USER_ROLES = Object.freeze({
  BENDAHARA: "bendahara",
  ANGGOTA: "anggota"
});

/**
 * Label deskriptif untuk setiap peran pengguna
 */
export const ROLE_LABELS = Object.freeze({
  [USER_ROLES.BENDAHARA]: "Bendahara (Admin)",
  [USER_ROLES.ANGGOTA]: "Anggota Kelas"
});

/**
 * Jenis transaksi kas
 * @readonly
 * @enum {string}
 */
export const TRANSACTION_TYPES = Object.freeze({
  MASUK: "masuk",
  KELUAR: "keluar"
});

/**
 * Label deskriptif jenis transaksi
 */
export const TRANSACTION_LABELS = Object.freeze({
  [TRANSACTION_TYPES.MASUK]: "Kas Masuk (Pemasukan)",
  [TRANSACTION_TYPES.KELUAR]: "Kas Keluar (Pengeluaran)"
});

/**
 * Status pembayaran iuran bulanan
 * @readonly
 * @enum {string}
 */
export const DUES_STATUS = Object.freeze({
  LUNAS: "lunas",
  BELUM_BAYAR: "belum_bayar"
});

/**
 * Label deskriptif status iuran
 */
export const DUES_STATUS_LABELS = Object.freeze({
  [DUES_STATUS.LUNAS]: "Lunas",
  [DUES_STATUS.BELUM_BAYAR]: "Belum Bayar"
});

/**
 * Varian tampilan visual komponen Badge
 * @readonly
 * @enum {string}
 */
export const BADGE_VARIANTS = Object.freeze({
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
  AMBER: "amber",
  INFO: "info",
  PRIMARY: "primary",
  NEUTRAL: "neutral"
});

/**
 * Varian tombol pada komponen Button
 * @readonly
 * @enum {string}
 */
export const BUTTON_VARIANTS = Object.freeze({
  PRIMARY: "primary",
  SECONDARY: "secondary",
  DANGER: "danger",
  GHOST: "ghost"
});

/**
 * Varian modal konfirmasi
 * @readonly
 * @enum {string}
 */
export const MODAL_VARIANTS = Object.freeze({
  PRIMARY: "primary",
  DANGER: "danger",
  WARNING: "warning"
});

/**
 * Path rute aplikasi KasPintar
 * @readonly
 * @enum {string}
 */
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

/**
 * Rute-rute publik yang dapat diakses tanpa autentikasi
 */
export const PUBLIC_ROUTES = Object.freeze([
  ROUTES.LOGIN,
  ROUTES.REGISTER
]);

/**
 * Rute-rute yang memerlukan hak akses khusus Bendahara
 */
export const RESTRICTED_BENDAHARA_ROUTES = Object.freeze([
  ROUTES.ANGGOTA,
  ROUTES.PENUNGGAK,
  ROUTES.KATEGORI,
  ROUTES.TRANSAKSI_BARU
]);

/**
 * Konfigurasi sistem dan parameter default aplikasi
 */
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
  },
  COOKIE_KEYS: {
    TOKEN: "kaspintar_token",
    USER: "kaspintar_user"
  }
});
