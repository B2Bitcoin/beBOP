import { adminLinks } from '../../routes/(app)/admin[[hash=admin_hash]]/adminLinks';
import type { Timestamps } from './Timestamps';
import { CUSTOMER_ROLE_ID } from './User';

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
	'/admin/*',
	...adminLinks.map((section) => section.links.map((link) => link.href + '/*')).flat()
];

export function isAllowedOnPage(role: Role, path: string, mode: 'read' | 'write'): boolean {
	path = path.replace(/^\/admin-[a-zA-Z0-9]+/, '/admin');
	if (path === '/admin' && role._id !== CUSTOMER_ROLE_ID) {
		return true;
	}
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
