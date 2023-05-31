import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

/**
 * NostR message to send
 */
export interface NostRNotification extends Timestamps {
	_id: ObjectId;

	content: string;
	dest: string;

	processedAt?: Date;
}
