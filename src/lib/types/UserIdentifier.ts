import type { ObjectId } from 'mongodb';

export interface UserIdentifier {
	userId?: ObjectId;
	email?: string;
	npub?: string;
	sessionId?: string;
	ssoIds?: string[];
}
