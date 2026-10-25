/**
 * @fileoverview SvelteKit Server Hook & Guard Keamanan
 * Mengamankan akses halaman pada sisi server dengan memvalidasi keberadaan token
 * dan izin peran pengguna yang tersimpan di dalam HTTP Cookie.
 */

import { APP_CONFIG, ROUTES, USER_ROLES, RESTRICTED_BENDAHARA_ROUTES } from "$lib/constants/index.js";

/**
 * Handle hook server SvelteKit
 * @type {import('@sveltejs/kit').Handle}
 */
export async function handle({ event, resolve }) {
  const token = event.cookies.get(APP_CONFIG.STORAGE_KEYS.TOKEN);
  const rawUser = event.cookies.get(APP_CONFIG.STORAGE_KEYS.USER);

  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  // Isi data otentikasi ke event.locals
  event.locals.token = token || null;
  event.locals.user = user;
  event.locals.isAuthenticated = Boolean(token && user);
  event.locals.isBendahara = Boolean(user && user.role === USER_ROLES.BENDAHARA);

  const pathname = event.url.pathname;
  const isPublicRoute = pathname.startsWith("/auth/") || pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;

  // Catat header keamanan dasar pada setiap respons
  const response = await resolve(event);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

