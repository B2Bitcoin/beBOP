import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface PasswordReset extends Timestamps {
	_id: ObjectId;
	userId: string;
	token: string;
	expiresAt: Date;
}
