import { describe, test, expect, beforeEach, vi } from "vitest";
import { auth } from "./auth.js";
import { toast } from "./toast.js";
import { tokenService } from "../services/tokenService.js";

describe("Svelte Stores", () => {
  beforeEach(() => {
    tokenService.clearSession();
  });

  describe("auth store", () => {
    test("login, updateUser, markLoaded, dan logout mengubah state store", () => {
      let currentState;
      const unsub = auth.subscribe((val) => {
        currentState = val;
      });

      // Login
      auth.login("jwt-abc", { username: "toman" });
      expect(currentState.token).toBe("jwt-abc");
      expect(currentState.user?.username).toBe("toman");
      expect(currentState.isLoaded).toBe(true);

      // Update User
      auth.updateUser({ username: "toman_updated", nama: "Toman Sihombing" });
      expect(currentState.user?.nama).toBe("Toman Sihombing");

      // Mark Loaded
      auth.markLoaded();
      expect(currentState.isLoaded).toBe(true);

      // Logout tanpa redirect
      auth.logout(false);
      expect(currentState.token).toBeNull();
      expect(currentState.user).toBeNull();

      // Logout dengan redirect (simulasi di lingkungan browser)
      const originalWindow = global.window;
      const originalDocument = global.document;
      global.window = {
        location: { pathname: "/dashboard", href: "/dashboard" }
      };
      global.document = { cookie: "" };

      expect(() => auth.logout(true)).not.toThrow();

      global.window = originalWindow;
      global.document = originalDocument;

      unsub();
    });
  });

  describe("toast store", () => {
    test("menampilkan dan menghapus toast dengan timeout otomatis", async () => {
      vi.useFakeTimers();
      let toasts = [];
      const unsub = toast.subscribe((val) => {
        toasts = val;
      });

      const id1 = toast.success("Berhasil simpan", 1000);
      expect(toasts.length).toBe(1);
      expect(toasts[0].message).toBe("Berhasil simpan");
      expect(toasts[0].type).toBe("success");

      toast.error("Gagal koneksi", 0);
      expect(toasts.length).toBe(2);

      toast.info("Informasi penting");
      expect(toasts.length).toBe(3);

      // Dismiss manual
      toast.dismiss(id1);
      expect(toasts.find((t) => t.id === id1)).toBeUndefined();

      // Auto dismiss via timer
      vi.advanceTimersByTime(5000);
      unsub();
      vi.useRealTimers();
    });
  });
});
