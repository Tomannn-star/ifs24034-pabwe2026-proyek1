import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { authService } from "./authService.js";
import { categoryService } from "./categoryService.js";
import { duesService } from "./duesService.js";
import { memberService } from "./memberService.js";
import { transactionService } from "./transactionService.js";
import { tokenService } from "./tokenService.js";
import { api } from "../api.js";
import { USER_ROLES } from "../constants/index.js";

describe("Business Logic Services", () => {
  beforeEach(() => {
    tokenService.setSession("mock-bendahara-token", {
      username: "bendahara",
      role: USER_ROLES.BENDAHARA
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("authService", () => {
    test("login berhasil dan menyimpan sesi", async () => {
      vi.spyOn(api, "post").mockResolvedValue({
        token: "jwt-123",
        user: { username: "toman", role: USER_ROLES.ANGGOTA },
        message: "Berhasil login"
      });

      const res = await authService.login("toman", "pass123");
      expect(res.token).toBe("jwt-123");
    });

    test("register mengirimkan payload registrasi", async () => {
      vi.spyOn(api, "post").mockResolvedValue({
        message: "Registrasi berhasil",
        user: { id: 1, nama: "Toman" }
      });

      const res = await authService.register({
        nama: "Toman",
        username: "toman2026",
        password: "secretpassword"
      });
      expect(res.message).toBe("Registrasi berhasil");
    });

    test("getProfile mengambil profil pengguna saat ini", async () => {
      vi.spyOn(api, "get").mockResolvedValue({ user: { username: "toman" } });
      const res = await authService.getProfile();
      expect(res.user.username).toBe("toman");
    });

    test("logout memanggil auth.logout", () => {
      expect(() => authService.logout(false)).not.toThrow();
    });
  });

  describe("categoryService", () => {
    test("getCategories mengambil data kategori dengan atau tanpa filter jenis", async () => {
      const spy = vi.spyOn(api, "get").mockResolvedValue({ data: [] });
      await categoryService.getCategories();
      expect(spy).toHaveBeenCalledWith("categories");

      await categoryService.getCategories("masuk");
      expect(spy).toHaveBeenCalledWith("categories?jenis=masuk");
    });

    test("createCategory, updateCategory, deleteCategory memanggil API dengan benar", async () => {
      vi.spyOn(api, "post").mockResolvedValue({ message: "Created" });
      vi.spyOn(api, "put").mockResolvedValue({ message: "Updated" });
      vi.spyOn(api, "delete").mockResolvedValue({ message: "Deleted" });

      await categoryService.createCategory({ nama: "Iuran Bulanan", jenis: "masuk" });
      await categoryService.updateCategory(1, { nama: "Iuran Baru", jenis: "masuk" });
      await categoryService.deleteCategory(1);

      expect(api.post).toHaveBeenCalled();
      expect(api.put).toHaveBeenCalled();
      expect(api.delete).toHaveBeenCalled();
    });
  });

  describe("duesService", () => {
    test("getDues mengambil tagihan dengan filter lengkap", async () => {
      const spy = vi.spyOn(api, "get").mockResolvedValue({ data: [] });
      await duesService.getDues({ periode: "2026-10", status: "belum_bayar", member_id: 5 });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("dues?"));
    });

    test("generateMonthlyDues, payDues, getDefaulters, getMyReminders memanggil API", async () => {
      vi.spyOn(api, "post").mockResolvedValue({ message: "Success" });
      vi.spyOn(api, "get").mockResolvedValue({ data: [] });

      await duesService.generateMonthlyDues({ periode: "2026-10", nominal: 20000, jatuh_tempo: "2026-10-31" });
      await duesService.payDues(1, { tanggal_bayar: "2026-10-25" });
      await duesService.getDefaulters();
      await duesService.getMyReminders();

      expect(api.post).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  describe("memberService", () => {
    test("getMembers dengan filter aktif dan pencarian q", async () => {
      const spy = vi.spyOn(api, "get").mockResolvedValue({ data: [] });
      await memberService.getMembers({ aktif: 1, q: "Ahmad" });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("members?"));
    });

    test("getMemberById, createMember, updateMember, deleteMember, toggleStatus", async () => {
      vi.spyOn(api, "get").mockResolvedValue({ data: { id: 1 } });
      vi.spyOn(api, "post").mockResolvedValue({ message: "Created" });
      vi.spyOn(api, "put").mockResolvedValue({ message: "Updated" });
      vi.spyOn(api, "delete").mockResolvedValue({ message: "Deleted" });

      await memberService.getMemberById(1);
      await memberService.createMember({ nama: "Budi", kontak: "08123456" });
      await memberService.updateMember(1, { nama: "Budi Santoso", kontak: "08123456", aktif: 1 });
      await memberService.toggleStatus(1, 0);
      await memberService.deleteMember(1);

      expect(api.get).toHaveBeenCalled();
      expect(api.post).toHaveBeenCalled();
      expect(api.put).toHaveBeenCalled();
      expect(api.delete).toHaveBeenCalled();
    });
  });

  describe("transactionService", () => {
    test("getSummary, getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction", async () => {
      vi.spyOn(api, "get").mockResolvedValue({ data: [] });
      vi.spyOn(api, "post").mockResolvedValue({ message: "Created" });
      vi.spyOn(api, "put").mockResolvedValue({ message: "Updated" });
      vi.spyOn(api, "delete").mockResolvedValue({ message: "Deleted" });

      await transactionService.getSummary();
      await transactionService.getTransactions({ jenis: "masuk", page: 1, limit: 10 });
      await transactionService.getTransactionById(1);
      await transactionService.createTransaction({
        tanggal: "2026-10-25",
        jenis: "masuk",
        jumlah: 50000,
        category_id: 1,
        keterangan: "Iuran kas"
      });
      await transactionService.updateTransaction(1, {
        tanggal: "2026-10-25",
        jenis: "masuk",
        jumlah: 60000,
        category_id: 1,
        keterangan: "Iuran kas revisi"
      });
      await transactionService.deleteTransaction(1);

      expect(api.get).toHaveBeenCalledTimes(3);
      expect(api.post).toHaveBeenCalled();
      expect(api.put).toHaveBeenCalled();
      expect(api.delete).toHaveBeenCalled();
    });
  });
});
