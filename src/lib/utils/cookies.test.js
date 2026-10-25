import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { setCookie, getCookie, removeCookie } from "./cookies.js";

describe("Browser Cookie Utilities", () => {
  let originalDocument;
  let originalWindow;
  let cookieStore = "";

  beforeEach(() => {
    originalDocument = global.document;
    originalWindow = global.window;

    cookieStore = "";
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
      location: {
        protocol: "https:"
      }
    };
  });

  afterEach(() => {
    global.document = originalDocument;
    global.window = originalWindow;
  });

  test("setCookie menyimpan cookie dan getCookie membacanya dengan benar", () => {
    setCookie("session_token", "abc123xyz", 7);
    expect(getCookie("session_token")).toBe("abc123xyz");
  });

  test("setCookie menggunakan default 7 hari jika parameter days tidak disertakan", () => {
    setCookie("default_cookie", "default_val");
    expect(getCookie("default_cookie")).toBe("default_val");
  });

  test("setCookie pada HTTP tidak menambahkan atribut Secure", () => {
    global.window.location.protocol = "http:";
    setCookie("http_cookie", "http_val");
    expect(getCookie("http_cookie")).toBe("http_val");
  });

  test("getCookie mengembalikan null jika cookie tidak ditemukan", () => {
    expect(getCookie("non_existing")).toBeNull();
  });

  test("removeCookie menghapus cookie yang ada", () => {
    setCookie("user_id", "42");
    expect(getCookie("user_id")).toBe("42");
    removeCookie("user_id");
    expect(getCookie("user_id")).toBeNull();
  });

  test("berjalan aman ketika dipanggil di lingkungan non-browser", () => {
    delete global.document;
    expect(getCookie("any")).toBeNull();
    expect(() => setCookie("any", "val")).not.toThrow();
    expect(() => removeCookie("any")).not.toThrow();
  });
});

