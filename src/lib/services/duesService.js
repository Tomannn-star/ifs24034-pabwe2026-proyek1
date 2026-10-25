/**
 * @fileoverview Service Manajemen Iuran & Penunggak KasPintar
 * Menangani pembuatan tagihan kas bulanan secara massal, pelunasan iuran,
 * monitoring status lunas/belum lunas, dan daftar penunggak
 * dengan pengamanan otorisasi peran Bendahara pada layer logika bisnis.
 */

import { api } from "../api.js";
import { assertBendahara } from "./guardService.js";

export const duesService = {
  /**
   * Mengambil daftar tagihan iuran kas dengan filter opsional.
   * 
   * @param {Object} [filter]
   * @param {string} [filter.periode] - Periode bulan YYYY-MM
   * @param {string} [filter.status] - 'lunas' atau 'belum_bayar'
   * @param {number|string} [filter.member_id] - ID anggota
   * @returns {Promise<{ data: Array<any> }>}
   */
  async getDues(filter = {}) {
    const params = new URLSearchParams();
    if (filter.periode) params.set("periode", filter.periode);
    if (filter.status) params.set("status", filter.status);
    if (filter.member_id) params.set("member_id", String(filter.member_id));

    const query = params.toString();
    const endpoint = query ? `dues?${query}` : "dues";
    return await api.get(endpoint);
  },

  /**
   * Menghasilkan tagihan iuran massal untuk seluruh anggota aktif pada periode tertentu (khusus Bendahara).
   * 
   * @param {Object} payload
   * @param {string} payload.periode - Format YYYY-MM (misal "2026-10")
   * @param {number} payload.nominal - Nominal per anggota (misal 20000)
   * @param {string} payload.jatuh_tempo - Tanggal jatuh tempo YYYY-MM-DD
   * @returns {Promise<{ message: string, generated_count: number }>}
   */
  async generateMonthlyDues(payload) {
    assertBendahara("Membuat tagihan iuran massal");
    return await api.post("dues/generate", {
      periode: payload.periode,
      nominal: Number(payload.nominal),
      jatuh_tempo: payload.jatuh_tempo
    });
  },

  /**
   * Mencatat pelunasan pembayaran tagihan iuran oleh anggota (khusus Bendahara).
   * 
   * @param {number|string} dueId - ID tagihan iuran
   * @param {Object} [options] - Opsi tambahan
   * @param {string} [options.tanggal_bayar] - Tanggal pembayaran YYYY-MM-DD
   * @returns {Promise<{ message: string, transaction: any }>}
   */
  async payDues(dueId, options = {}) {
    assertBendahara("Mencatat pelunasan iuran kas");
    return await api.post(`dues/${dueId}/pay`, options);
  },

  /**
   * Mengambil daftar anggota yang memiliki tunggakan iuran belum lunas.
   * 
   * @returns {Promise<{ data: Array<any> }>}
   */
  async getDefaulters() {
    return await api.get("reminders/defaulters");
  },

  /**
   * Mengambil pengingat tagihan iuran pribadi untuk anggota yang sedang login.
   * 
   * @returns {Promise<{ pending_dues: Array<any>, total_tunggakan: number }>}
   */
  async getMyReminders() {
    return await api.get("reminders/my");
  }
};
