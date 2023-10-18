import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface Session extends Timestamps {
	_id: ObjectId;
	userId?: ObjectId;
	email?: string;
	npub?: string;
	authLink?: {
		token: string;
		expiresAt: Date;
	};
	sessionId: string;
	expiresAt: Date;
}
