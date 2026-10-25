import { auth } from "./stores/auth.js";
import { browser } from "$app/environment";

// Ambil URL API dari environment variable (PUBLIC_API_URL atau VITE_API_URL)
const envApiUrl = import.meta.env.PUBLIC_API_URL || 
                  import.meta.env.VITE_API_URL || 
                  import.meta.env.VITE_PUBLIC_API_URL;

/**
 * Mendapatkan base URL API secara dinamis:
 * 1. Mengutamakan env variable jika diset
 * 2. Jika diakses dari domain Vercel (*.vercel.app), otomatis arahkan ke Vercel backend
 * 3. Jika di localhost, arahkan ke port 5001
 */
export function getBaseUrl() {
  if (envApiUrl && envApiUrl.trim() !== "") {
    return envApiUrl.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return "https://ifs24034-pabwe2026-proyek1-backend.vercel.app/api";
  }
  return "http://localhost:5001/api";
}

/**
 * Helper request HTTP terpusat untuk KasPintar.
 * Otomatis menyertakan token JWT pada header Authorization.
 * Menangani respon 401 Unauthorized dengan otomatis logout.
 * 
 * @param {string} endpoint - Path endpoint (misal '/summary' atau '/transactions')
 * @param {RequestInit} [options] - Opsi fetch bawaan
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/${endpoint.replace(/^\//, "")}`;

  let token = null;
  if (browser) {
    token = localStorage.getItem("kaspintar_token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (err) {
    // Tangani error jaringan (misal server backend belum dinyalakan atau tidak dapat dijangkau)
    throw new Error(
      `Gagal terhubung ke server backend (${baseUrl}). Pastikan server backend sedang aktif.`
    );
  }

  // Jika token tidak valid / kedaluwarsa, otomatis logout ke login page
  if (response.status === 401) {
    if (browser && !window.location.pathname.startsWith("/auth/") && window.location.pathname !== "/login") {
      auth.logout(true);
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Sesi login telah berakhir, silakan masuk kembali");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Permintaan gagal dengan status ${response.status}`);
  }

  return data;
}

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" })
};

