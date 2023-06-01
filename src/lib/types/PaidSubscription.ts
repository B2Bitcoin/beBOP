/**
 * For paid subscriptions
 */

import type { Timestamps } from './Timestamps';

export interface PaidSubscription extends Timestamps {
	_id: string;

	number: number;
	npub: string;
	productId: string;

	paidUntil: Date;
	lastRemindedAt?: Date;
	cancelledAt?: Date;
}
