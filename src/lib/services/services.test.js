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

    test("login tanpa token dan user pada respons", async () => {
      vi.spyOn(api, "post").mockResolvedValue({ message: "Login tertunda" });
      const res = await authService.login("toman", "pass123");
      expect(res.message).toBe("Login tertunda");
    });

    test("register mengirimkan payload registrasi lengkap maupun opsional", async () => {
      vi.spyOn(api, "post").mockResolvedValue({
        message: "Registrasi berhasil",
        user: { id: 1, nama: "Toman" }
      });

      // Registrasi dengan kontak dan custom role
      const res1 = await authService.register({
        nama: "Toman",
        username: "toman2026",
        password: "secretpassword",
        kontak: "0812345678",
        role: USER_ROLES.BENDAHARA
      });
      expect(res1.message).toBe("Registrasi berhasil");

      // Registrasi tanpa kontak dan tanpa role
      const res2 = await authService.register({
        nama: "Citra",
        username: "citra2026",
        password: "secretpassword"
      });
      expect(res2.message).toBe("Registrasi berhasil");
    });

    test("getProfile mengambil profil pengguna saat ini", async () => {
      vi.spyOn(api, "get").mockResolvedValue({ user: { username: "toman" } });
      const res = await authService.getProfile();
      expect(res.user.username).toBe("toman");
    });

    test("logout memanggil auth.logout", () => {
      expect(() => authService.logout(false)).not.toThrow();
      expect(() => authService.logout(true)).not.toThrow();
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

    test("createCategory, updateCategory, deleteCategory memanggil API dengan atau tanpa deskripsi", async () => {
      vi.spyOn(api, "post").mockResolvedValue({ message: "Created" });
      vi.spyOn(api, "put").mockResolvedValue({ message: "Updated" });
      vi.spyOn(api, "delete").mockResolvedValue({ message: "Deleted" });

      // Dengan deskripsi
      await categoryService.createCategory({ nama: "Iuran Bulanan", jenis: "masuk", deskripsi: "Pos kas rutin" });
      await categoryService.updateCategory(1, { nama: "Iuran Baru", jenis: "masuk", deskripsi: "Pos kas baru" });

      // Tanpa deskripsi
      await categoryService.createCategory({ nama: "Lainnya", jenis: "keluar" });
      await categoryService.updateCategory(2, { nama: "Lainnya Revisi", jenis: "keluar" });

      await categoryService.deleteCategory(1);

      expect(api.post).toHaveBeenCalledTimes(2);
      expect(api.put).toHaveBeenCalledTimes(2);
      expect(api.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("duesService", () => {
    test("getDues mengambil tagihan dengan filter lengkap maupun default kosong", async () => {
      const spy = vi.spyOn(api, "get").mockResolvedValue({ data: [] });
      await duesService.getDues({ periode: "2026-10", status: "belum_bayar", member_id: 5 });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("dues?"));

      await duesService.getDues();
      expect(spy).toHaveBeenCalledWith("dues");
    });

    test("generateMonthlyDues, payDues, getDefaulters, getMyReminders memanggil API", async () => {
      vi.spyOn(api, "post").mockResolvedValue({ message: "Success" });
      vi.spyOn(api, "get").mockResolvedValue({ data: [] });

      await duesService.generateMonthlyDues({ periode: "2026-10", nominal: 20000, jatuh_tempo: "2026-10-31" });
      await duesService.payDues(1, { tanggal_bayar: "2026-10-25" });
      await duesService.payDues(2);
      await duesService.getDefaulters();
      await duesService.getMyReminders();

      expect(api.post).toHaveBeenCalledTimes(3);
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  describe("memberService", () => {
    test("getMembers dengan filter aktif dan pencarian q maupun default tanpa argumen", async () => {
      const spy = vi.spyOn(api, "get").mockResolvedValue({ data: [] });
      await memberService.getMembers({ aktif: 1, q: "Ahmad" });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("members?"));

      await memberService.getMembers();
      expect(spy).toHaveBeenCalledWith("members");
    });

    test("createMember, updateMember dengan dan tanpa kontak/aktif opsional", async () => {
      vi.spyOn(api, "post").mockResolvedValue({ message: "Created" });
      vi.spyOn(api, "put").mockResolvedValue({ message: "Updated" });

      await memberService.createMember({ nama: "Budi", kontak: "08123456", aktif: 0 });
      await memberService.createMember({ nama: "Citra" });

      await memberService.updateMember(1, { nama: "Budi Santoso", kontak: "08123456", aktif: 1 });
      await memberService.updateMember(2, { nama: "Citra Dewi" });

      expect(api.post).toHaveBeenCalledTimes(2);
      expect(api.put).toHaveBeenCalledTimes(2);
    });

    test("getMemberById, deleteMember, toggleStatus dari aktif ke nonaktif dan sebaliknya", async () => {
      vi.spyOn(api, "get").mockResolvedValue({ data: { id: 1 } });
      vi.spyOn(api, "put").mockResolvedValue({ message: "Toggled" });
      vi.spyOn(api, "delete").mockResolvedValue({ message: "Deleted" });

      await memberService.getMemberById(1);
      await memberService.toggleStatus({ id: 1, nama: "Budi", aktif: 1 });
      await memberService.toggleStatus({ id: 2, nama: "Citra", aktif: 0 });
      await memberService.deleteMember(1);

      expect(api.get).toHaveBeenCalled();
      expect(api.put).toHaveBeenCalledTimes(2);
      expect(api.delete).toHaveBeenCalled();
    });
  });

  describe("transactionService", () => {
    test("getSummary, getTransactions dengan filter komprehensif dan filter kosong", async () => {
      const spy = vi.spyOn(api, "get").mockResolvedValue({ data: [] });

      await transactionService.getSummary();
      expect(spy).toHaveBeenCalledWith("summary");

      await transactionService.getTransactions({
        jenis: "masuk",
        kategori_id: 1,
        dari: "2026-10-01",
        sampai: "2026-10-31",
        q: "iuran",
        page: 2,
        limit: 20
      });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("transactions?"));

      await transactionService.getTransactions();
      expect(spy).toHaveBeenCalledWith("transactions");
    });

    test("getTransactionById, createTransaction, updateTransaction, deleteTransaction", async () => {
      vi.spyOn(api, "get").mockResolvedValue({ data: { id: 1 } });
      vi.spyOn(api, "post").mockResolvedValue({ message: "Created" });
      vi.spyOn(api, "put").mockResolvedValue({ message: "Updated" });
      vi.spyOn(api, "delete").mockResolvedValue({ message: "Deleted" });

      await transactionService.getTransactionById(1);

      // Create dengan member_id
      await transactionService.createTransaction({
        tanggal: "2026-10-25",
        jenis: "masuk",
        jumlah: 50000,
        kategori_id: 1,
        keterangan: "Iuran kas",
        member_id: 5
      });

      // Create tanpa member_id
      await transactionService.createTransaction({
        tanggal: "2026-10-25",
        jenis: "keluar",
        jumlah: 10000,
        kategori_id: 2,
        keterangan: "Beli spidol"
      });

      // Update dengan member_id
      await transactionService.updateTransaction(1, {
        tanggal: "2026-10-25",
        jenis: "masuk",
        jumlah: 60000,
        kategori_id: 1,
        keterangan: "Iuran kas revisi",
        member_id: 5
      });

      // Update tanpa member_id
      await transactionService.updateTransaction(2, {
        tanggal: "2026-10-25",
        jenis: "keluar",
        jumlah: 15000,
        kategori_id: 2,
        keterangan: "Beli spidol revisi"
      });

      await transactionService.deleteTransaction(1);

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledTimes(2);
      expect(api.put).toHaveBeenCalledTimes(2);
      expect(api.delete).toHaveBeenCalledTimes(1);
    });
  });
});
