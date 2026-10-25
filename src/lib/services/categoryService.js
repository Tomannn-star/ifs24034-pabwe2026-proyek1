/**
 * @fileoverview Service Manajemen Kategori KasPintar
 * Menangani operasi CRUD kategori pos kas (pemasukan & pengeluaran)
 * dengan pengamanan otorisasi peran Bendahara pada layer logika bisnis.
 */

import { api } from "../api.js";
import { assertBendahara } from "./guardService.js";

export const categoryService = {
  /**
   * Mengambil daftar seluruh kategori pos kas kelas.
   * 
   * @param {string} [jenis] - 'masuk' atau 'keluar'
   * @returns {Promise<{ data: Array<any> }>}
   */
  async getCategories(jenis) {
    const query = jenis ? `?jenis=${jenis}` : "";
    return await api.get(`categories${query}`);
  },

  /**
   * Menambahkan kategori pos kas baru (khusus Bendahara).
   * 
   * @param {Object} data
   * @param {string} data.nama - Nama kategori
   * @param {string} data.jenis - 'masuk' atau 'keluar'
   * @param {string} [data.deskripsi] - Deskripsi pos kas
   * @returns {Promise<{ message: string, data: any }>}
   */
  async createCategory(data) {
    assertBendahara("Menambahkan kategori pos kas");
    return await api.post("categories", {
      nama: data.nama.trim(),
      jenis: data.jenis,
      deskripsi: data.deskripsi?.trim() || null
    });
  },

  /**
   * Memperbarui informasi kategori pos kas (khusus Bendahara).
   * 
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<{ message: string, data: any }>}
   */
  async updateCategory(id, data) {
    assertBendahara("Memperbarui kategori pos kas");
    return await api.put(`categories/${id}`, {
      nama: data.nama.trim(),
      jenis: data.jenis,
      deskripsi: data.deskripsi?.trim() || null
    });
  },

  /**
   * Menghapus kategori pos kas berdasarkan ID (khusus Bendahara).
   * 
   * @param {number|string} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteCategory(id) {
    assertBendahara("Menghapus kategori pos kas");
    return await api.delete(`categories/${id}`);
  }
};
