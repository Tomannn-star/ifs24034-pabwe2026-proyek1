import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { tokenService, TokenService } from "./tokenService.js";
import { USER_ROLES, APP_CONFIG } from "../constants/index.js";

describe("Token & Session Management Service", () => {
  let originalLocalStorage;
  let originalDocument;
  let originalWindow;
  let storage = {};
  let cookieStore = "";

  beforeEach(() => {
    storage = {};
    cookieStore = "";

    originalLocalStorage = global.localStorage;
    originalDocument = global.document;
    originalWindow = global.window;

    global.localStorage = {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: (k) => { delete storage[k]; },
      clear: () => { storage = {}; }
    };

    global.document = {
      get cookie() {
        return cookieStore;
      },
      set cookie(val) {
        const pair = val.split(";")[0];
        const [k, v] = pair.split("=");
        const parts = cookieStore ? cookieStore.split("; ") : [];
        const filtered = parts.filter(p => !p.startsWith(`${k}=`));
        if (val.includes("max-age=0")) {
          cookieStore = filtered.join("; ");
        } else {
          filtered.push(`${k}=${v}`);
          cookieStore = filtered.join("; ");
        }
      }
    };

    global.window = {
      location: { protocol: "https:" }
    };

    tokenService.clearSession();
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    global.document = originalDocument;
    global.window = originalWindow;
  });

  function makeMockJwt(payload) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${header}.${body}.mock-signature`;
  }

  describe("decodePayload & isTokenExpired", () => {
    test("decodePayload mengembalikan null jika format bukan JWT valid", () => {
      expect(tokenService.decodePayload(null)).toBeNull();
      expect(tokenService.decodePayload("")).toBeNull();
      expect(tokenService.decodePayload("invalid-format")).toBeNull();
      expect(tokenService.decodePayload("a.b.c.d")).toBeNull();
      expect(tokenService.decodePayload("part1.not-json.part3")).toBeNull();
    });

    test("decodePayload berhasil mengurai JSON payload dari JWT", () => {
      const jwt = makeMockJwt({ uid: "user-123", username: "toman" });
      const decoded = tokenService.decodePayload(jwt);
      expect(decoded).toEqual({ uid: "user-123", username: "toman" });
    });

    test("isTokenExpired mendeteksi token valid dan token kedaluwarsa", () => {
      expect(tokenService.isTokenExpired(null)).toBe(true);

      const noExpJwt = makeMockJwt({ uid: "user-1" });
      expect(tokenService.isTokenExpired(noExpJwt)).toBe(false);

      const futureExpJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
      expect(tokenService.isTokenExpired(futureExpJwt)).toBe(false);

      const pastExpJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
      expect(tokenService.isTokenExpired(pastExpJwt)).toBe(true);
    });
  });

  describe("setSession, getToken, getUser & clearSession", () => {
    test("menyimpan dan membaca sesi aktif pengguna", () => {
      const validJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 7200, role: USER_ROLES.BENDAHARA });
      const mockUser = { username: "bendahara", role: USER_ROLES.BENDAHARA };

      tokenService.setSession(validJwt, mockUser);

      expect(tokenService.isAuthenticated()).toBe(true);
      expect(tokenService.getToken()).toBe(validJwt);
      expect(tokenService.getUser()).toEqual(mockUser);
      expect(tokenService.hasRole(USER_ROLES.BENDAHARA)).toBe(true);
      expect(tokenService.hasRole(USER_ROLES.ANGGOTA)).toBe(false);
    });

    test("hasRole mengembalikan false jika belum ada user", () => {
      tokenService.clearSession();
      expect(tokenService.hasRole(USER_ROLES.BENDAHARA)).toBe(false);
    });

    test("membersihkan sesi otomatis jika token yang tersimpan telah kedaluwarsa", () => {
      const expiredJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
      tokenService.setSession(expiredJwt, { username: "expired_user" });

      expect(tokenService.getToken()).toBeNull();
      expect(tokenService.getUser()).toBeNull();
      expect(tokenService.isAuthenticated()).toBe(false);
    });

    test("setUser memperbarui data profil pengguna aktif", () => {
      const validJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 7200 });
      tokenService.setSession(validJwt, { username: "user1", nama: "Nama Lama" });

      tokenService.setUser({ username: "user1", nama: "Nama Baru Terupdate" });
      expect(tokenService.getUser()?.nama).toBe("Nama Baru Terupdate");
    });

    test("clearSession menghapus seluruh token dan profil dari storage dan cookies", () => {
      const validJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 7200 });
      tokenService.setSession(validJwt, { username: "tester" });
      expect(tokenService.isAuthenticated()).toBe(true);

      tokenService.clearSession();
      expect(tokenService.isAuthenticated()).toBe(false);
      expect(tokenService.getToken()).toBeNull();
      expect(tokenService.getUser()).toBeNull();
    });

    test("konstruktor TokenService membaca sesi yang sudah tersimpan di cookies/localStorage", () => {
      const validJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 7200 });
      const savedUser = { username: "preexisting_user" };

      storage[APP_CONFIG.STORAGE_KEYS.TOKEN] = validJwt;
      storage[APP_CONFIG.STORAGE_KEYS.USER] = JSON.stringify(savedUser);

      const newServiceInstance = new TokenService();
      expect(newServiceInstance.getToken()).toBe(validJwt);
      expect(newServiceInstance.getUser()?.username).toBe("preexisting_user");
    });

    test("konstruktor TokenService membersihkan token expired yang tersimpan di cookies/storage", () => {
      const expiredJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
      storage[APP_CONFIG.STORAGE_KEYS.TOKEN] = expiredJwt;

      const newServiceInstance = new TokenService();
      expect(newServiceInstance.getToken()).toBeNull();
    });

    test("konstruktor TokenService menangani parsing JSON user yang korup", () => {
      const validJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 7200 });
      storage[APP_CONFIG.STORAGE_KEYS.TOKEN] = validJwt;
      storage[APP_CONFIG.STORAGE_KEYS.USER] = "invalid-json-string";

      const newServiceInstance = new TokenService();
      expect(newServiceInstance.getUser()).toBeNull();
    });

    test("getUser menangani korupsi data user di storage secara langsung", () => {
      const validJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 7200 });
      cookieStore = "";
      storage = {};
      tokenService.clearSession();
      storage[APP_CONFIG.STORAGE_KEYS.TOKEN] = validJwt;
      storage[APP_CONFIG.STORAGE_KEYS.USER] = "{ invalid json";

      expect(tokenService.getUser()).toBeNull();
    });

    test("getUser membersihkan sesi dan mengembalikan null jika token saat ini telah expired", () => {
      const expiredJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
      tokenService.setSession(expiredJwt, { username: "expired_user" });
      expect(tokenService.getUser()).toBeNull();
      expect(tokenService.getToken()).toBeNull();
    });

    test("membaca token dan user dari localStorage saat cookie kosong", () => {
      const validJwt = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 7200 });
      cookieStore = "";
      storage = {};
      storage[APP_CONFIG.STORAGE_KEYS.TOKEN] = validJwt;
      storage[APP_CONFIG.STORAGE_KEYS.USER] = JSON.stringify({ username: "local_only_user" });

      const newInst = new TokenService();
      expect(newInst.getToken()).toBe(validJwt);
      expect(newInst.getUser()?.username).toBe("local_only_user");
    });

    test("berjalan aman ketika localStorage tidak tersedia (undefined)", () => {
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      const token = makeMockJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
      tokenService.setSession(token, { username: "no_ls_user" });

      expect(tokenService.getToken()).toBe(token);
      expect(tokenService.getUser()?.username).toBe("no_ls_user");
      tokenService.setUser({ username: "no_ls_user_updated" });
      tokenService.clearSession();

      global.localStorage = originalLocalStorage;
    });
  });
});
