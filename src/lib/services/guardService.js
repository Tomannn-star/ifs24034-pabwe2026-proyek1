/**
 * @fileoverview Service Otorisasi dan Guard Keamanan KasPintar
 * Menyediakan fungsi validasi hak akses dan peran (Role-Based Access Control)
 * pada layer logika bisnis independen dari tampilan UI.
 */

import { tokenService } from "./tokenService.js";
import { USER_ROLES, RESTRICTED_BENDAHARA_ROUTES, ROUTES } from "../constants/index.js";

export class AuthorizationError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=403]
   */
  constructor(message = "Akses ditolak: Anda tidak memiliki wewenang untuk tindakan ini", statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

/**
 * Memastikan sesi aktif terautentikasi sebelum mengeksekusi operasi data.
 * @param {string} [actionName="Operasi ini"]
 * @throws {AuthorizationError} Jika belum login
 */
export function assertAuthenticated(actionName = "Operasi ini") {
  if (!tokenService.isAuthenticated()) {
    throw new AuthorizationError(
      `${actionName} memerlukan autentikasi. Silakan masuk terlebih dahulu.`,
      401
    );
  }
}

/**
 * Memastikan pengguna memiliki peran tertentu (misal: Bendahara).
 * Berfungsi di sisi logika bisnis agar tidak bergantung pada elemen UI.
 * 
 * @param {string} requiredRole - Role yang dipersyaratkan (USER_ROLES.BENDAHARA / USER_ROLES.ANGGOTA)
 * @param {string} [actionName="Tindakan ini"]
 * @throws {AuthorizationError} Jika role tidak sesuai
 */
export function assertRole(requiredRole, actionName = "Tindakan ini") {
  assertAuthenticated(actionName);
  const user = tokenService.getUser();
  if (user?.role !== requiredRole) {
    const roleName = requiredRole === USER_ROLES.BENDAHARA ? "Bendahara" : "Anggota";
    throw new AuthorizationError(
      `Akses ditolak: ${actionName} hanya dapat dilakukan oleh peran ${roleName}.`,
      403
    );
  }
}

/**
 * Memastikan pengguna aktif adalah Bendahara
 * @param {string} [actionName="Aksi kelola kas"]
 */
export function assertBendahara(actionName = "Aksi kelola kas") {
  assertRole(USER_ROLES.BENDAHARA, actionName);
}

/**
 * Memeriksa apakah path yang diminta diizinkan untuk peran pengguna aktif
 * @param {string} path - URL pathname yang diakses
 * @returns {{ allowed: boolean, redirectTo?: string, reason?: string }}
 */
export function checkRouteAccess(path) {
  const isAuth = tokenService.isAuthenticated();
  const user = tokenService.getUser();
  const isPublic = path.startsWith("/auth/") || path === ROUTES.LOGIN || path === ROUTES.REGISTER;

  if (!isAuth && !isPublic) {
    return {
      allowed: false,
      redirectTo: ROUTES.LOGIN,
      reason: "Halaman ini memerlukan login"
    };
  }

  if (isAuth && isPublic) {
    return {
      allowed: false,
      redirectTo: ROUTES.HOME,
      reason: "Sudah terautentikasi"
    };
  }

  if (isAuth && user?.role === USER_ROLES.ANGGOTA) {
    const isRestricted = RESTRICTED_BENDAHARA_ROUTES.some((prefix) => path.startsWith(prefix));
    if (isRestricted) {
      return {
        allowed: false,
        redirectTo: ROUTES.HOME,
        reason: "Menu ini hanya dapat diakses oleh Bendahara"
      };
    }
  }

  return { allowed: true };
}

