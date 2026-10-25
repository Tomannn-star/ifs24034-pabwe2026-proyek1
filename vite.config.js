import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import process from 'process';

/**
 * Konfigurasi Vite & SvelteKit untuk KasPintar (Delcom DWS: bun-sveltekit)
 * Menggunakan @sveltejs/adapter-bun untuk deploy ke runtime Bun.
 */
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const port = Number(process.env.PORT || process.env.APP_PORT || env.PORT || env.APP_PORT) || 6070;

	return {
		envPrefix: ['VITE_', 'PUBLIC_'],
		plugins: [
			tailwindcss(),
			sveltekit({
				alias: {
					$lib: 'src/lib'
				},
				adapter: adapter({
					out: 'build',
					precompress: false,
					serverOptions: {
						hostname: '0.0.0.0',
						port: port
					}
				})
			})
		],
		server: {
			port: port,
			host: '0.0.0.0'
		},
		preview: {
			port: port,
			host: '0.0.0.0'
		}
	};
});
