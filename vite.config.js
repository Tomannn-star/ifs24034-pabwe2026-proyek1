import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/**
 * Konfigurasi Vite & SvelteKit untuk KasPintar
 * Menggunakan @sveltejs/adapter-static dengan direktori output 'build'
 * dan fallback '404.html' untuk routing Single Page Application (SPA).
 */
export default defineConfig({
	envPrefix: ['VITE_', 'PUBLIC_'],
	plugins: [
		tailwindcss(),
		sveltekit({
			alias: {
				$lib: 'src/lib'
			},
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: false,
				strict: false
			})
		})
	]
});
