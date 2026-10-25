import { describe, test, expect } from "bun:test";
import {
  validateName,
  validateUsername,
  validatePassword,
  validateNominal,
  validatePhone,
  validateKeterangan,
  validateTanggal,
  sanitizeInput
} from "./validators.js";

describe("Input Validation & Security Utilities", () => {
  test("validateName memverifikasi nama dengan benar", () => {
    expect(validateName("")).toBe("Nama lengkap wajib diisi");
    expect(validateName("A")).toBe("Nama lengkap minimal 2 karakter");
    expect(validateName("Toman Sihombing")).toBeNull();
  });

  test("validateUsername membatasi format dan panjang username", () => {
    expect(validateUsername("")).toBe("Username wajib diisi");
    expect(validateUsername("ab")).toBe("Username minimal 3 karakter");
    expect(validateUsername("user@name")).toBe("Username hanya boleh memuat huruf, angka, dan garis bawah (_)");
    expect(validateUsername("bendahara")).toBeNull();
  });

  test("validatePassword memverifikasi panjang kata sandi", () => {
    expect(validatePassword("")).toBe("Password wajib diisi");
    expect(validatePassword("12345")).toBe("Password minimal 6 karakter");
    expect(validatePassword("password123")).toBeNull();
  });

  test("validateNominal memverifikasi angka positif utuh", () => {
    expect(validateNominal("")).toBe("Nominal uang wajib diisi");
    expect(validateNominal("bukan_angka")).toBe("Nominal harus berupa angka valid");
    expect(validateNominal(0, 1000)).toMatch(/minimal/);
    expect(validateNominal(25000)).toBeNull();
  });

  test("validatePhone memvalidasi format nomor handphone Indonesia", () => {
    expect(validatePhone("")).toBeNull(); // opsional
    expect(validatePhone("12345")).toBe("Format nomor WhatsApp tidak valid (contoh: 081234567890)");
    expect(validatePhone("081234567890")).toBeNull();
    expect(validatePhone("+6281234567890")).toBeNull();
  });

  test("validateTanggal memvalidasi format ISO YYYY-MM-DD", () => {
    expect(validateTanggal("")).toBe("Tanggal wajib dipilih");
    expect(validateTanggal("23/10/2026")).toBe("Format tanggal tidak valid (harus YYYY-MM-DD)");
    expect(validateTanggal("2026-10-25")).toBeNull();
  });

  test("sanitizeInput membersihkan tag HTML untuk mencegah XSS", () => {
    expect(sanitizeInput("<script>alert('xss')</script>Hello")).toBe("Hello");
    expect(sanitizeInput("<b>Bold Text</b>")).toBe("Bold Text");
  });
});
