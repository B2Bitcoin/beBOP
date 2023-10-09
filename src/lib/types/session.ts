import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface Session extends Timestamps {
	_id: ObjectId;
	userId: string;
	sessionId: string;
	expiresAt: Date;
}
