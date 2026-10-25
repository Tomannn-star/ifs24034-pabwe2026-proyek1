/**
 * @fileoverview Utilitas Penanganan Error Terpusat KasPintar
 * Menyediakan pemetaan dan normalisasi pesan error dari respon HTTP / jaringan
 * ke pesan yang mudah dipahami oleh pengguna dalam Bahasa Indonesia yang ramah.
 */

/**
 * Mengekstrak dan menerjemahkan pesan error dari exception atau respon API.
 * 
 * @param {any} error - Objek error yang ditangkap (Error, Response, atau string)
 * @param {string} [fallbackMessage="Terjadi kesalahan pada sistem. Silakan coba lagi."]
 * @returns {string} Pesan error yang bersih dan mudah dipahami
 */
export function extractErrorMessage(error, fallbackMessage = "Terjadi kesalahan pada sistem. Silakan coba lagi.") {
  if (!error) return fallbackMessage;

  if (typeof error === "string") {
    return error.trim();
  }

  // Jika error adalah instance Error dari fetch / apiRequest
  if (error instanceof Error) {
    const msg = error.message;

    // Normalisasi error jaringan dan koneksi server
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Gagal terhubung")) {
      return "Tidak dapat terhubung ke server backend. Pastikan koneksi internet stabil dan server aktif.";
    }

    if (msg.includes("Sesi login telah berakhir")) {
      return "Sesi login Anda telah kedaluwarsa. Silakan masuk kembali.";
    }

    return msg;
  }

  // Jika error berbentuk payload objek JSON dari backend { error: "..." }
  if (typeof error === "object" && error.error) {
    return String(error.error);
  }

  return fallbackMessage;
}
