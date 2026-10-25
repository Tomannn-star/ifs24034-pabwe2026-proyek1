import { describe, test, expect, vi } from "vitest";
import { handle } from "./hooks.server.js";
import { APP_CONFIG, USER_ROLES } from "./lib/constants/index.js";

describe("SvelteKit Server Hooks", () => {
  test("menangani request dengan user bendahara valid", async () => {
    const cookiesMap = {
      [APP_CONFIG.STORAGE_KEYS.TOKEN]: "valid-token-123",
      [APP_CONFIG.STORAGE_KEYS.USER]: JSON.stringify({
        id: 1,
        username: "bendahara",
        role: USER_ROLES.BENDAHARA
      })
    };

    const headersMap = new Map();
    const event = {
      cookies: {
        get: (key) => cookiesMap[key] || null
      },
      locals: {},
      url: new URL("http://localhost:5173/transaksi")
    };

    const mockResponse = {
      headers: {
        set: (k, v) => headersMap.set(k, v)
      }
    };

    const resolve = vi.fn().mockResolvedValue(mockResponse);

    const res = await handle({ event, resolve });

    expect(event.locals.token).toBe("valid-token-123");
    expect(event.locals.user.username).toBe("bendahara");
    expect(event.locals.isAuthenticated).toBe(true);
    expect(event.locals.isBendahara).toBe(true);
    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res).toBe(mockResponse);
  });

  test("menangani cookie user yang korup", async () => {
    const cookiesMap = {
      [APP_CONFIG.STORAGE_KEYS.USER]: "{ invalid json"
    };

    const headersMap = new Map();
    const event = {
      cookies: {
        get: (key) => cookiesMap[key] || null
      },
      locals: {},
      url: new URL("http://localhost:5173/auth/login")
    };

    const mockResponse = {
      headers: {
        set: (k, v) => headersMap.set(k, v)
      }
    };

    const resolve = vi.fn().mockResolvedValue(mockResponse);

    await handle({ event, resolve });

    expect(event.locals.token).toBeNull();
    expect(event.locals.user).toBeNull();
    expect(event.locals.isAuthenticated).toBe(false);
    expect(event.locals.isBendahara).toBe(false);
  });

  test("menangani request saat cookies kosong tanpa user dan tanpa token", async () => {
    const headersMap = new Map();
    const event = {
      cookies: {
        get: () => null
      },
      locals: {},
      url: new URL("http://localhost:5173/auth/register")
    };

    const mockResponse = {
      headers: {
        set: (k, v) => headersMap.set(k, v)
      }
    };

    const resolve = vi.fn().mockResolvedValue(mockResponse);

    await handle({ event, resolve });

    expect(event.locals.token).toBeNull();
    expect(event.locals.user).toBeNull();
    expect(event.locals.isAuthenticated).toBe(false);
  });
});
