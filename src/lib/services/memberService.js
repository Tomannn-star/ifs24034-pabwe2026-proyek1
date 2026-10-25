/**
 * @fileoverview Service Manajemen Anggota Kelas KasPintar
 * Menangani operasi CRUD (Create, Read, Update, Delete) data anggota kas kelas.
 */

import { api } from "../api.js";

export const memberService = {
  /**
   * Mengambil daftar seluruh anggota kelas dengan filter opsional.
   * 
   * @param {Object} [filter]
   * @param {string|number} [filter.aktif] - 1 untuk aktif, 0 untuk nonaktif
   * @param {string} [filter.q] - Kata kunci pencarian nama atau kontak
   * @returns {Promise<{ data: Array<any> }>}
   */
  async getMembers(filter = {}) {
    const params = new URLSearchParams();
    if (filter.aktif !== undefined && filter.aktif !== "") {
      params.set("aktif", String(filter.aktif));
    }
    if (filter.q && filter.q.trim()) {
      params.set("q", filter.q.trim());
    }
    const query = params.toString();
    return await api.get(`members${query ? `?${query}` : ""}`);
  },

  /**
   * Mengambil detail satu data anggota berdasarkan ID.
   * 
   * @param {number|string} id
   * @returns {Promise<{ data: any }>}
   */
  async getMemberById(id) {
    return await api.get(`members/${id}`);
  },

  /**
   * Menambahkan data anggota baru.
   * 
   * @param {Object} data
   * @param {string} data.nama - Nama lengkap anggota
   * @param {string} [data.kontak] - Nomor WhatsApp atau HP
   * @param {number} [data.aktif=1] - Status keaktifan (1 atau 0)
   * @returns {Promise<{ message: string, data: any }>}
   */
  async createMember(data) {
    return await api.post("members", {
      nama: data.nama.trim(),
      kontak: data.kontak?.trim() || null,
      aktif: data.aktif !== undefined ? Number(data.aktif) : 1
    });
  },

  /**
   * Memperbarui informasi data anggota yang sudah ada.
   * 
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<{ message: string, data: any }>}
   */
  async updateMember(id, data) {
    return await api.put(`members/${id}`, {
      nama: data.nama.trim(),
      kontak: data.kontak?.trim() || null,
      aktif: data.aktif !== undefined ? Number(data.aktif) : 1
    });
  },

  /**
   * Mengubah status keaktifan anggota secara cepat (toggle).
   * 
   * @param {Object} member - Objek anggota
   * @returns {Promise<{ message: string, data: any }>}
   */
  async toggleStatus(member) {
    const nextStatus = member.aktif === 1 ? 0 : 1;
    return await api.put(`members/${member.id}`, {
      nama: member.nama,
      kontak: member.kontak,
      aktif: nextStatus
    });
  },

  /**
   * Menghapus data anggota berdasarkan ID.
   * 
   * @param {number|string} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteMember(id) {
    return await api.delete(`members/${id}`);
  }
};
