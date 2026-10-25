/**
 * @fileoverview Server-Side Layout Load
 * Menyalurkan data autentikasi server dari event.locals ke data layout SvelteKit
 */

export async function load({ locals, url }) {
  return {
    isAuthenticated: locals.isAuthenticated || false,
    user: locals.user || null,
    isBendahara: locals.isBendahara || false,
    pathname: url.pathname
  };
}

