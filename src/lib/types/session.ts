import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface Session extends Timestamps {
	_id: ObjectId;
	userId?: ObjectId;
	email?: string;
	npub?: string;
	sessionId: string;
	expiresAt: Date;
	sso?: Array<{
		provider: string;
		email?: string;
		avatarUrl?: string;
		name: string;
		id: string;
	}>;
}
