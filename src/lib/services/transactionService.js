/**
 * @fileoverview Service Manajemen Transaksi Keuangan KasPintar
 * Menangani pencatatan mutasi kas masuk & keluar, ringkasan saldo,
 * grafik bulanan, paginasi, dan filter transaksi
 * dengan pengamanan otorisasi peran Bendahara pada layer logika bisnis.
 */

import { api } from "../api.js";
import { assertBendahara } from "./guardService.js";

export const transactionService = {
  /**
   * Mengambil ringkasan saldo kas, total pemasukan, dan total pengeluaran.
   * 
   * @returns {Promise<{ saldo: number, total_masuk: number, total_keluar: number, monthly: Array<any> }>}
   */
  async getSummary() {
    return await api.get("summary");
  },

  /**
   * Mengambil daftar transaksi kas dengan dukungan paginasi dan filter saringan.
   * 
   * @param {Object} [filter]
   * @param {string} [filter.jenis] - 'masuk' atau 'keluar'
   * @param {string|number} [filter.kategori_id] - ID kategori
   * @param {string} [filter.dari] - Tanggal awal YYYY-MM-DD
   * @param {string} [filter.sampai] - Tanggal akhir YYYY-MM-DD
   * @param {string} [filter.q] - Pencarian teks keterangan / anggota
   * @param {number} [filter.page=1] - Nomor halaman
   * @param {number} [filter.limit=10] - Jumlah per halaman
   * @returns {Promise<{ data: Array<any>, pagination: { total: number, page: number, limit: number, total_pages: number } }>}
   */
  async getTransactions(filter = {}) {
    const params = new URLSearchParams();
    if (filter.jenis) params.set("jenis", filter.jenis);
    if (filter.kategori_id) params.set("kategori_id", String(filter.kategori_id));
    if (filter.dari) params.set("dari", filter.dari);
    if (filter.sampai) params.set("sampai", filter.sampai);
    if (filter.q && filter.q.trim()) params.set("q", filter.q.trim());
    if (filter.page) params.set("page", String(filter.page));
    if (filter.limit) params.set("limit", String(filter.limit));

    const query = params.toString();
    return await api.get(`transactions${query ? `?${query}` : ""}`);
  },

  /**
   * Mengambil detail satu data transaksi berdasarkan ID.
   * 
   * @param {number|string} id
   * @returns {Promise<{ data: any }>}
   */
  async getTransactionById(id) {
    return await api.get(`transactions/${id}`);
  },

  /**
   * Mencatat transaksi kas baru (pemasukan atau pengeluaran, khusus Bendahara).
   * 
   * @param {Object} data
   * @param {string} data.jenis - 'masuk' atau 'keluar'
   * @param {number|string} data.kategori_id - ID kategori pos kas
   * @param {number|string} data.jumlah - Nominal transaksi bulat
   * @param {string} data.tanggal - Tanggal transaksi YYYY-MM-DD
   * @param {string} data.keterangan - Catatan transaksi
   * @param {number|string} [data.member_id] - ID anggota (opsional)
   * @returns {Promise<{ message: string, data: any }>}
   */
  async createTransaction(data) {
    assertBendahara("Mencatat transaksi kas baru");
    return await api.post("transactions", {
      jenis: data.jenis,
      kategori_id: Number(data.kategori_id),
      jumlah: Number(data.jumlah),
      tanggal: data.tanggal,
      keterangan: data.keterangan.trim(),
      member_id: data.member_id ? Number(data.member_id) : null
    });
  },

  /**
   * Memperbarui informasi data transaksi yang sudah tercatat (khusus Bendahara).
   * 
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<{ message: string, data: any }>}
   */
  async updateTransaction(id, data) {
    assertBendahara("Memperbarui transaksi kas");
    return await api.put(`transactions/${id}`, {
      jenis: data.jenis,
      kategori_id: Number(data.kategori_id),
      jumlah: Number(data.jumlah),
      tanggal: data.tanggal,
      keterangan: data.keterangan.trim(),
      member_id: data.member_id ? Number(data.member_id) : null
    });
  },

  /**
   * Menghapus transaksi kas berdasarkan ID (khusus Bendahara).
   * 
   * @param {number|string} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteTransaction(id) {
    assertBendahara("Menghapus transaksi kas");
    return await api.delete(`transactions/${id}`);
  }
};
