import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface Subscription extends Timestamps {
	_id: ObjectId;

	npub: string;
}
