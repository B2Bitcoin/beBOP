import { existsSync } from 'fs';
import { join, normalize } from 'path/posix';

export const rootDir = (() => {
	let currentPath = import.meta.url;

	while (currentPath !== '/') {
		if (existsSync(join(currentPath, 'package.json'))) {
			return currentPath;
		}

		currentPath = normalize(join(currentPath, '..'));
	}

	return '/';
})();
