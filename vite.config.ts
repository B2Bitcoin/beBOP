import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';
import { readdir, stat, writeFile, readFile, mkdir } from 'fs/promises';

async function recursiveCopy(src: string, dest: string) {
	for (const file of await readdir(src)) {
		if (file === '.' || file === '..') {
			continue;
		}

		const isDir = await stat(`${src}/${file}`).then((s) => s.isDirectory());

		if (isDir) {
			await recursiveCopy(`${src}/${file}`, `${dest}/${file}`);
		} else {
			await mkdir(dest, { recursive: true });
			await writeFile(`${dest}/${file}`, await readFile(`${src}/${file}`));
		}
	}
}

await recursiveCopy('node_modules/tinymce', 'static/tinymce');

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte'
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
