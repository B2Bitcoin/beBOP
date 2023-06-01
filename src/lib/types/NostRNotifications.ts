import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

/**
 * NostR message to send
 */
export interface NostRNotification extends Timestamps {
	_id: ObjectId;

	content: string;
	dest: string;

	/** When replying to someone, we may want to increase seconds by 1 in our reply */
	minCreatedAt?: Date;

	processedAt?: Date;
}
