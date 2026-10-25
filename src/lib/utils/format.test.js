import { describe, test, expect } from "vitest";
import { formatRupiah, formatTanggal, formatPeriode } from "./format.js";

describe("Frontend Format Utilities", () => {
  describe("formatRupiah", () => {
    test("memformat angka valid menjadi format Rupiah tanpa desimal", () => {
      const res = formatRupiah(25000);
      expect(res).toContain("25.000");
    });

    test("memformat string angka menjadi format Rupiah", () => {
      const res = formatRupiah("100000");
      expect(res).toContain("100.000");
    });

    test("menangani nilai 0 atau input tidak valid secara aman", () => {
      expect(formatRupiah(0)).toContain("0");
      expect(formatRupiah(null)).toContain("0");
      expect(formatRupiah(undefined)).toContain("0");
      expect(formatRupiah("invalid")).toContain("0");
    });
  });

  describe("formatTanggal", () => {
    test("mengembalikan tanda hubung '-' jika input kosong", () => {
      expect(formatTanggal("")).toBe("-");
      expect(formatTanggal(null)).toBe("-");
      expect(formatTanggal(undefined)).toBe("-");
    });

    test("memformat string YYYY-MM-DD ke Bahasa Indonesia", () => {
      const formatted = formatTanggal("2026-10-23");
      expect(formatted).toContain("23");
      expect(formatted).toContain("Oktober");
      expect(formatted).toContain("2026");
    });

    test("memformat tanggal yang memiliki bagian jam (YYYY-MM-DD HH:mm:ss)", () => {
      const formatted = formatTanggal("2026-05-17 14:30:00");
      expect(formatted).toContain("17");
      expect(formatted).toContain("Mei");
      expect(formatted).toContain("2026");
    });

    test("mengembalikan string asli jika format bukan 3 bagian tanggal", () => {
      expect(formatTanggal("2026-10")).toBe("2026-10");
      expect(formatTanggal("not-a-date")).toBe("not-a-date");
    });
  });

  describe("formatPeriode", () => {
    test("mengembalikan '-' atau string asli jika format periode tidak valid", () => {
      expect(formatPeriode("")).toBe("-");
      expect(formatPeriode(null)).toBe("-");
      expect(formatPeriode(undefined)).toBe("-");
      expect(formatPeriode("2026")).toBe("2026");
    });

    test("memformat YYYY-MM ke nama bulan dan tahun Indonesia", () => {
      const formatted = formatPeriode("2026-10");
      expect(formatted).toContain("Oktober");
      expect(formatted).toContain("2026");
    });

    test("menangani string yang melempar error pada DateTimeFormat", () => {
      expect(formatPeriode("-100000000-999999999")).toBe("-100000000-999999999");
    });
  });
});
