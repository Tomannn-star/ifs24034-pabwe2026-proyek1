import { describe, test, expect, beforeEach } from "vitest";
import {
  checkRouteAccess,
  assertAuthenticated,
  assertRole,
  assertBendahara,
  AuthorizationError
} from "./guardService.js";
import { tokenService } from "./tokenService.js";
import { USER_ROLES, ROUTES } from "../constants/index.js";

describe("Guard Service & RBAC Authorization", () => {
  beforeEach(() => {
    tokenService.clearSession();
  });

  describe("AuthorizationError", () => {
    test("memiliki pesan default dan status code 403", () => {
      const err = new AuthorizationError();
      expect(err.name).toBe("AuthorizationError");
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain("Akses ditolak");
    });

    test("mendukung custom message dan custom statusCode", () => {
      const err = new AuthorizationError("Unauthenticated", 401);
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe("Unauthenticated");
    });
  });

  describe("assertAuthenticated & assertRole", () => {
    test("assertAuthenticated melempar 401 jika belum login", () => {
      expect(() => assertAuthenticated("Operasi simpan")).toThrow(AuthorizationError);
    });

    test("assertAuthenticated tidak melempar error jika pengguna aktif terautentikasi", () => {
      tokenService.setSession("mock-token", { username: "anggota1", role: USER_ROLES.ANGGOTA });
      expect(() => assertAuthenticated()).not.toThrow();
    });

    test("assertRole melempar 403 jika role tidak sesuai untuk bendahara", () => {
      tokenService.setSession("mock-token", { username: "anggota1", role: USER_ROLES.ANGGOTA });
      expect(() => assertRole(USER_ROLES.BENDAHARA, "Kelola kas")).toThrow(/Bendahara/);
    });

    test("assertRole melempar 403 jika role tidak sesuai untuk anggota", () => {
      tokenService.setSession("mock-token", { username: "admin", role: USER_ROLES.BENDAHARA });
      expect(() => assertRole(USER_ROLES.ANGGOTA, "Tindakan anggota")).toThrow(/Anggota/);
    });

    test("assertRole sukses jika role pengguna cocok", () => {
      tokenService.setSession("mock-token", { username: "admin", role: USER_ROLES.BENDAHARA });
      expect(() => assertRole(USER_ROLES.BENDAHARA)).not.toThrow();
    });

    test("assertBendahara memverifikasi peran bendahara", () => {
      tokenService.setSession("mock-token", { username: "admin", role: USER_ROLES.BENDAHARA });
      expect(() => assertBendahara("Catat transaksi")).not.toThrow();
    });
  });

  describe("checkRouteAccess", () => {
    test("mengarahkan pengunjung tanpa login ke halaman login saat akses rute privat", () => {
      const access = checkRouteAccess("/anggota");
      expect(access.allowed).toBe(false);
      expect(access.redirectTo).toBe(ROUTES.LOGIN);
    });

    test("mengizinkan akses ke rute publik saat belum login", () => {
      const accessLogin = checkRouteAccess("/auth/login");
      expect(accessLogin.allowed).toBe(true);

      const accessRegister = checkRouteAccess("/auth/register");
      expect(accessRegister.allowed).toBe(true);
    });

    test("mengarahkan pengguna terautentikasi ke home saat mencoba akses halaman login", () => {
      tokenService.setSession("mock-token", { username: "toman", role: USER_ROLES.ANGGOTA });
      const access = checkRouteAccess(ROUTES.LOGIN);
      expect(access.allowed).toBe(false);
      expect(access.redirectTo).toBe(ROUTES.HOME);
    });

    test("mengarahkan anggota biasa ke dashboard jika mengakses menu khusus bendahara", () => {
      tokenService.setSession("mock-token", { username: "toman", role: USER_ROLES.ANGGOTA });
      const access = checkRouteAccess("/penunggak");
      expect(access.allowed).toBe(false);
      expect(access.redirectTo).toBe(ROUTES.HOME);
    });

    test("mengizinkan bendahara mengakses seluruh menu administrasi", () => {
      tokenService.setSession("mock-token", { username: "bendahara", role: USER_ROLES.BENDAHARA });
      expect(checkRouteAccess("/anggota").allowed).toBe(true);
      expect(checkRouteAccess("/kategori").allowed).toBe(true);
      expect(checkRouteAccess("/penunggak").allowed).toBe(true);
    });

    test("mengizinkan anggota biasa mengakses halaman umum", () => {
      tokenService.setSession("mock-token", { username: "anggota1", role: USER_ROLES.ANGGOTA });
      expect(checkRouteAccess("/transaksi").allowed).toBe(true);
      expect(checkRouteAccess("/iuran").allowed).toBe(true);
    });
  });
});
