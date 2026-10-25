import { describe, test, expect } from "bun:test";
import { formatRupiah, formatTanggal, formatPeriode } from "./format.js";

describe("Frontend Format Utilities", () => {
  test("formatRupiah memformat nominal angka menjadi format IDR tanpa desimal", () => {
    expect(formatRupiah(20000)).toMatch(/Rp\s*20\.000/);
    expect(formatRupiah(1250000)).toMatch(/Rp\s*1\.250\.000/);
    expect(formatRupiah(0)).toMatch(/Rp\s*0/);
  });

  test("formatTanggal memformat string YYYY-MM-DD ke Bahasa Indonesia", () => {
    const formatted = formatTanggal("2026-10-23");
    expect(formatted).toMatch(/23\s+Oktober\s+2026/i);
  });

  test("formatPeriode memformat YYYY-MM ke nama bulan dan tahun", () => {
    const formatted = formatPeriode("2026-10");
    expect(formatted).toMatch(/Oktober\s+2026/i);
  });
});

