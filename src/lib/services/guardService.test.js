import { describe, test, expect } from "vitest";
import { checkRouteAccess, assertRole, assertBendahara, AuthorizationError } from "./guardService.js";
import { USER_ROLES, ROUTES } from "../constants/index.js";

describe("Guard Service & RBAC Authorization", () => {
  test("checkRouteAccess mengarahkan pengunjung tanpa login ke halaman login", () => {
    const access = checkRouteAccess("/anggota");
    expect(access.allowed).toBe(false);
    expect(access.redirectTo).toBe(ROUTES.LOGIN);
  });

  test("checkRouteAccess mengizinkan akses ke rute publik", () => {
    const access = checkRouteAccess(ROUTES.LOGIN);
    expect(access.allowed).toBe(true);
  });

  test("assertBendahara melempar AuthorizationError jika belum login", () => {
    expect(() => assertBendahara("Tes Aksi")).toThrow(AuthorizationError);
  });
});

