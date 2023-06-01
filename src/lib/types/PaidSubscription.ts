/**
 * For paid subscriptions
 */

import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface PaidSubscription extends Timestamps {
	_id: ObjectId;

	npub: string;
	productId: string;

	paidUntil: Date;
	lastRemindedAt?: Date;
}
