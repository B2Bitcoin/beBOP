import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface NostRNotification extends Timestamps {
	_id: ObjectId;

	content: string;
	dest: string;

	processedAt?: Date;
}
