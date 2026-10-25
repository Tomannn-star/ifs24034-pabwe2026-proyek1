import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { getBaseUrl, apiRequest, api } from "./api.js";
import { tokenService } from "./services/tokenService.js";
import { auth } from "./stores/auth.js";

describe("API Client & Helper", () => {
  let originalFetch;
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalWindow = global.window;
    originalDocument = global.document;
    tokenService.clearSession();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  describe("getBaseUrl", () => {
    test("mengembalikan base URL yang valid", () => {
      const url = getBaseUrl();
      expect(url).toBeDefined();
      expect(typeof url).toBe("string");
      expect(url.length).toBeGreaterThan(0);
    });
  });

  describe("apiRequest", () => {
    test("melakukan fetch dengan header Content-Type dan Authorization jika ada token", async () => {
      tokenService.setSession("my-jwt-token", { username: "tester" });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [1, 2, 3] })
      });

      const data = await apiRequest("summary");
      expect(data).toEqual({ success: true, data: [1, 2, 3] });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchArgs = global.fetch.mock.calls[0];
      expect(fetchArgs[1].headers["Authorization"]).toBe("Bearer my-jwt-token");
    });

    test("melempar error saat jaringan gagal / backend down", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network failed"));

      await expect(apiRequest("transactions")).rejects.toThrow(/Gagal terhubung ke server backend/);
    });

    test("melempar error jika respon 401 Unauthorized dan memicu logout di browser", async () => {
      global.window = {
        location: { pathname: "/transactions", hostname: "localhost" }
      };
      global.document = { cookie: "" };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: "Sesi Anda telah berakhir" })
      });

      await expect(apiRequest("profile")).rejects.toThrow(/Sesi/);
    });

    test("melempar error umum jika respon status error non-401 tanpa payload error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => { throw new Error("Invalid JSON"); }
      });

      await expect(apiRequest("members")).rejects.toThrow("Permintaan gagal dengan status 500");
    });
  });

  describe("api convenience methods", () => {
    test("api.get, api.post, api.put, api.delete mengirim HTTP methods yang tepat", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: true })
      });

      await api.get("test");
      expect(global.fetch.mock.calls[0][1].method).toBe("GET");

      await api.post("test", { name: "A" });
      expect(global.fetch.mock.calls[1][1].method).toBe("POST");
      expect(global.fetch.mock.calls[1][1].body).toBe(JSON.stringify({ name: "A" }));

      await api.put("test/1", { name: "B" });
      expect(global.fetch.mock.calls[2][1].method).toBe("PUT");

      await api.delete("test/1");
      expect(global.fetch.mock.calls[3][1].method).toBe("DELETE");
    });
  });
});
