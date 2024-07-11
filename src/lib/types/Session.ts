import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';
import { CountryAlpha2 } from './Country';

export interface Session extends Timestamps {
	_id: ObjectId;
	userId?: ObjectId;
	email?: string;
	npub?: string;
	sessionId: string;
	expireUserAt?: Date;
	expiresAt: Date;
	sso?: Array<{
		provider: string;
		email?: string;
		avatarUrl?: string;
		name: string;
		id: string;
	}>;
	pos?: {
		countryCodeOverwrite?: CountryAlpha2;
	};
}
