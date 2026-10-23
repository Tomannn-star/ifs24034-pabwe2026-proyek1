import { auth } from "./stores/auth.js";
import { browser } from "$app/environment";

// URL API diambil dari environment variable PUBLIC_API_URL atau fallback port 5001
const BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:5001/api";

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
  const url = `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

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

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Jika token tidak valid / kedaluwarsa, otomatis logout ke login page
  if (response.status === 401) {
    if (browser && !window.location.pathname.startsWith("/login")) {
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

