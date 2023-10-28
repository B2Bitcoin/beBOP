import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface User extends Timestamps {
	_id: ObjectId;
	login: string;
	// Not defined until the user logs resets their password
	password?: string;
	backupInfo?: {
		email?: string;
		npub?: string;
	};
	roleId: string;
	status?: string;
	lastLoginAt?: Date;
	passwordReset?: {
		token: string;
		expiresAt: Date;
	};
}

export const SUPER_ADMIN_ROLE_ID = 'super-admin';
export const POS_ROLE_ID = 'point-of-sale';
export const CUSTOMER_ROLE_ID = 'customer';
