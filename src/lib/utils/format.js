/**
 * Format angka ke format mata uang Rupiah (contoh: Rp 20.000)
 * 
 * @param {number|string} amount 
 * @returns {string}
 */
export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format tanggal YYYY-MM-DD ke format Indonesia (contoh: 23 Oktober 2026)
 * 
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatTanggal(dateStr) {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split(" ")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format periode YYYY-MM ke nama bulan dan tahun (contoh: Oktober 2026)
 * 
 * @param {string} periodeStr 
 * @returns {string}
 */
export function formatPeriode(periodeStr) {
  if (!periodeStr || !periodeStr.includes("-")) return periodeStr || "-";
  try {
    const [year, month] = periodeStr.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric"
    }).format(date);
  } catch (e) {
    return periodeStr;
  }
}

