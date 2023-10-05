import type { Timestamps } from './Timestamps';

export interface User extends Timestamps {
	_id: string;
	login: string;
	password: string;
	backupInfo: {
		email?: string;
		nostr?: string;
	};
	roleId: string;
	status: string;
	lastLoginAt: Date;
}
