import { describe, test, expect } from "vitest";
import { load } from "./+layout.server.js";
import { ssr, prerender } from "./+layout.js";

describe("Root Layout Server & Client Configuration", () => {
  test("ssr dan prerender bernilai sesuai spesifikasi SPA", () => {
    expect(ssr).toBe(false);
    expect(prerender).toBe("auto");
  });

  test("load menyalurkan data locals terautentikasi ke layout", async () => {
    const locals = {
      isAuthenticated: true,
      user: { username: "toman", role: "anggota" },
      isBendahara: false
    };
    const url = new URL("http://localhost:5173/dashboard");

    const data = await load({ locals, url });
    expect(data.isAuthenticated).toBe(true);
    expect(data.user.username).toBe("toman");
    expect(data.isBendahara).toBe(false);
    expect(data.pathname).toBe("/dashboard");
  });

  test("load menangani locals kosong", async () => {
    const locals = {};
    const url = new URL("http://localhost:5173/");

    const data = await load({ locals, url });
    expect(data.isAuthenticated).toBe(false);
    expect(data.user).toBeNull();
    expect(data.isBendahara).toBe(false);
    expect(data.pathname).toBe("/");
  });
});

