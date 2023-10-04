import type { Timestamps } from './Timestamps';

export interface User extends Timestamps {
	_id: string;
	login: string;
	password: string;
	backupAddressType: 'nostr' | 'email';
	backupAddressValue: string;
	roleId: string;
	status: string;
	memorize: 'none' | '1h' | '1d' | '1w' | '1m' | 'max';
	sessionId?: string;
}
