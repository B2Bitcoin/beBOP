/**
 * For paid subscriptions
 */

import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface PaidSubscription extends Timestamps {
	_id: string;

	number: number;
	npub: string;
	productId: string;

	paidUntil: Date;

	notifications: Array<{
		type: 'reminder' | 'expiration';
		createdAt: Date;
		_id: ObjectId;
	}>;

	cancelledAt?: Date;
}
