import { describe, test, expect } from "vitest";
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
  describe("validateName", () => {
    test("memvalidasi nama kosong", () => {
      expect(validateName("")).toBe("Nama lengkap wajib diisi");
      expect(validateName(null)).toBe("Nama lengkap wajib diisi");
      expect(validateName("   ")).toBe("Nama lengkap wajib diisi");
    });

    test("memvalidasi panjang minimum dan maksimum nama", () => {
      expect(validateName("A")).toBe("Nama lengkap minimal 2 karakter");
      expect(validateName("A".repeat(101))).toBe("Nama lengkap maksimal 100 karakter");
    });

    test("menerima nama valid", () => {
      expect(validateName("Toman Sihombing")).toBeNull();
      expect(validateName("O'Connor")).toBeNull();
      expect(validateName("Al")).toBeNull();
    });
  });

  describe("validateUsername", () => {
    test("memvalidasi username kosong", () => {
      expect(validateUsername("")).toBe("Username wajib diisi");
      expect(validateUsername(null)).toBe("Username wajib diisi");
    });

    test("memvalidasi panjang minimum dan maksimum username", () => {
      expect(validateUsername("ab")).toBe("Username minimal 3 karakter");
      expect(validateUsername("u".repeat(31))).toBe("Username maksimal 30 karakter");
    });

    test("menolak username dengan karakter tidak diizinkan", () => {
      expect(validateUsername("User-Name")).toBe("Username hanya boleh memuat huruf, angka, dan garis bawah (_)");
      expect(validateUsername("user name")).toBe("Username hanya boleh memuat huruf, angka, dan garis bawah (_)");
      expect(validateUsername("user@name")).toBe("Username hanya boleh memuat huruf, angka, dan garis bawah (_)");
    });

    test("menerima username valid", () => {
      expect(validateUsername("bendahara")).toBeNull();
      expect(validateUsername("anggota_1")).toBeNull();
      expect(validateUsername("toman2026")).toBeNull();
    });
  });

  describe("validatePassword", () => {
    test("memvalidasi password kosong", () => {
      expect(validatePassword("")).toBe("Password wajib diisi");
      expect(validatePassword(null)).toBe("Password wajib diisi");
    });

    test("memvalidasi panjang minimum dan maksimum password", () => {
      expect(validatePassword("12345")).toBe("Password minimal 6 karakter");
      expect(validatePassword("123456")).toBeNull();
      expect(validatePassword("p".repeat(101))).toBe("Password maksimal 100 karakter");
    });
  });

  describe("validateNominal", () => {
    test("memvalidasi nominal kosong", () => {
      expect(validateNominal("")).toBe("Nominal uang wajib diisi");
      expect(validateNominal(null)).toBe("Nominal uang wajib diisi");
      expect(validateNominal(undefined)).toBe("Nominal uang wajib diisi");
    });

    test("menolak nilai non-angka", () => {
      expect(validateNominal("bukan_angka")).toBe("Nominal harus berupa angka valid");
    });

    test("memvalidasi batas minimum", () => {
      expect(validateNominal(500, 1000)).toContain("Nominal minimal adalah Rp 1.000");
    });

    test("menolak angka desimal", () => {
      expect(validateNominal(10500.5)).toBe("Nominal uang harus berupa angka bulat tanpa desimal");
    });

    test("menerima nominal bilangan bulat valid", () => {
      expect(validateNominal(20000)).toBeNull();
      expect(validateNominal("50000")).toBeNull();
    });
  });

  describe("validatePhone", () => {
    test("bersifat opsional jika string kosong", () => {
      expect(validatePhone("")).toBeNull();
      expect(validatePhone(null)).toBeNull();
      expect(validatePhone("   ")).toBeNull();
    });

    test("menolak nomor telepon tidak valid", () => {
      expect(validatePhone("12345")).toBe("Format nomor WhatsApp tidak valid (contoh: 081234567890)");
      expect(validatePhone("abcd-efgh")).toBe("Format nomor WhatsApp tidak valid (contoh: 081234567890)");
    });

    test("menerima format nomor HP Indonesia", () => {
      expect(validatePhone("081234567890")).toBeNull();
      expect(validatePhone("+6281234567890")).toBeNull();
      expect(validatePhone("6281234567890")).toBeNull();
      expect(validatePhone("0812-3456-7890")).toBeNull();
    });
  });

  describe("validateKeterangan", () => {
    test("memvalidasi keterangan wajib jika required=true", () => {
      expect(validateKeterangan("")).toBe("Keterangan wajib diisi");
      expect(validateKeterangan(null)).toBe("Keterangan wajib diisi");
    });

    test("mengizinkan keterangan kosong jika required=false", () => {
      expect(validateKeterangan("", false)).toBeNull();
      expect(validateKeterangan(null, false)).toBeNull();
    });

    test("memvalidasi panjang minimum dan maksimum keterangan", () => {
      expect(validateKeterangan("ab")).toBe("Keterangan minimal 3 karakter");
      expect(validateKeterangan("a".repeat(256))).toBe("Keterangan maksimal 255 karakter");
    });

    test("menerima keterangan valid", () => {
      expect(validateKeterangan("Iuran kas bulan Oktober 2026")).toBeNull();
    });
  });

  describe("validateTanggal", () => {
    test("memvalidasi tanggal kosong", () => {
      expect(validateTanggal("")).toBe("Tanggal wajib dipilih");
      expect(validateTanggal(null)).toBe("Tanggal wajib dipilih");
    });

    test("menolak format tanggal yang tidak sesuai YYYY-MM-DD", () => {
      expect(validateTanggal("23-10-2026")).toBe("Format tanggal tidak valid (harus YYYY-MM-DD)");
      expect(validateTanggal("2026/10/23")).toBe("Format tanggal tidak valid (harus YYYY-MM-DD)");
    });

    test("menolak tanggal kalender tidak valid", () => {
      expect(validateTanggal("2026-99-99")).toBe("Tanggal kalender tidak valid");
    });

    test("menerima tanggal valid", () => {
      expect(validateTanggal("2026-10-23")).toBeNull();
    });
  });

  describe("sanitizeInput", () => {
    test("membersihkan tag HTML dan script untuk mencegah XSS", () => {
      expect(sanitizeInput("<script>alert('xss')</script>Halo")).toBe("Halo");
      expect(sanitizeInput("<b>Teks Tebal</b>")).toBe("Teks Tebal");
      expect(sanitizeInput("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    test("menangani input non-string secara aman", () => {
      expect(sanitizeInput(12345)).toBe("");
      expect(sanitizeInput(null)).toBe("");
      expect(sanitizeInput(undefined)).toBe("");
    });
  });
});
