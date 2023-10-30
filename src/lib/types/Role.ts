import type { Timestamps } from './Timestamps';

export interface Role extends Timestamps {
	_id: string;
	name: string;

	permissions: {
		read: string[];
		write: string[];
		forbidden: string[];
	};
}

export const defaultRoleOptions = [
	'/admin/*', // hard-coded ref in admin/login to check where to redirect
	'/admin/layout/*',
	'/admin/config/*',
	'/admin/product/*',
	'/admin/picture/*',
	'/admin/bitcoin/*',
	'/admin/lightning/*',
	'/admin/order/*',
	'/admin/nostr/*',
	'/admin/email/*',
	'/admin/cms/*',
	'/admin/challenge/*',
	'/admin/discount/*',
	'/admin/arm/*',
	'/admin/backup/*',
	'/admin/tags/*'
];

export function isAllowedOnPage(role: Role, path: string, mode: 'read' | 'write'): boolean {
	for (const forbidden of role.permissions.forbidden) {
		if (forbidden.endsWith('*')) {
			if (path.startsWith(forbidden.slice(0, -1)) || path === forbidden.replace(/\/?\*$/, '')) {
				return false;
			}
		} else if (path === forbidden) {
			return false;
		}
	}

	for (const write of role.permissions.write) {
		if (write.endsWith('*')) {
			if (path.startsWith(write.slice(0, -1)) || path === write.replace(/\/?\*$/, '')) {
				return true;
			}
		} else if (path === write) {
			return true;
		}
	}

	if (mode === 'read') {
		for (const read of role.permissions.read) {
			if (read.endsWith('*')) {
				if (path.startsWith(read.slice(0, -1)) || path === read.replace(/\/?\*$/, '')) {
					return true;
				}
			} else if (path === read) {
				return true;
			}
		}
	}

	return false;
}
