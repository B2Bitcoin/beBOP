/**
 * For paid subscriptions
 */

import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface PaidSubscription extends Timestamps {
	_id: string;

	number: number;

	// One of these two must be set
	npub?: string;
	email?: string;

	productId: string;

	paidUntil: Date;

	notifications: Array<{
		type: 'reminder' | 'expiration';
		createdAt: Date;
		/** 'none' is in the case where the notification medium is not supported */
		medium: 'nostr' | 'none'; // todo: email
		_id: ObjectId;
	}>;

	cancelledAt?: Date;
}
