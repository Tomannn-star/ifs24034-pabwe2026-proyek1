import { describe, test, expect } from "vitest";
import { extractErrorMessage } from "./errorHandler.js";

describe("Centralized Error Handler Utilities", () => {
  test("mengembalikan fallbackMessage jika error bernilai null atau undefined", () => {
    expect(extractErrorMessage(null)).toBe("Terjadi kesalahan pada sistem. Silakan coba lagi.");
    expect(extractErrorMessage(undefined, "Pesan default custom")).toBe("Pesan default custom");
  });

  test("mengembalikan string error langsung jika input bertipe string", () => {
    expect(extractErrorMessage("Username telah terdaftar")).toBe("Username telah terdaftar");
    expect(extractErrorMessage("   Error dengan spasi   ")).toBe("Error dengan spasi");
  });

  test("menerjemahkan error jaringan Failed to fetch dan NetworkError ke pesan ramah", () => {
    const fetchErr = new Error("Failed to fetch");
    expect(extractErrorMessage(fetchErr)).toContain("Tidak dapat terhubung ke server backend");

    const netErr = new Error("NetworkError when attempting to fetch resource");
    expect(extractErrorMessage(netErr)).toContain("Tidak dapat terhubung ke server backend");

    const connErr = new Error("Gagal terhubung ke host");
    expect(extractErrorMessage(connErr)).toContain("Tidak dapat terhubung ke server backend");
  });

  test("menerjemahkan pesan sesi kedaluwarsa", () => {
    const expiredErr = new Error("Sesi login telah berakhir, silakan login ulang");
    expect(extractErrorMessage(expiredErr)).toBe("Sesi login Anda telah kedaluwarsa. Silakan masuk kembali.");
  });

  test("mengembalikan error.message standar untuk exception umum", () => {
    const customErr = new Error("Validasi input gagal");
    expect(extractErrorMessage(customErr)).toBe("Validasi input gagal");
  });

  test("menangani objek response JSON backend yang memiliki properti error", () => {
    const backendPayload = { error: "Saldo kas kelas tidak mencukupi" };
    expect(extractErrorMessage(backendPayload)).toBe("Saldo kas kelas tidak mencukupi");
  });

  test("mengembalikan fallbackMessage jika objek tidak memiliki properti error", () => {
    const unknownObj = { status: 500 };
    expect(extractErrorMessage(unknownObj, "Terjadi gangguan server")).toBe("Terjadi gangguan server");
  });
});

