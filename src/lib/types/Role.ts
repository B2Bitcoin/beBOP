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
	'/admin/*',
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
