/**
 * For subscriptions to the catalog
 */
import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface BootikSubscription extends Timestamps {
	_id: ObjectId;

	npub: string;
}
