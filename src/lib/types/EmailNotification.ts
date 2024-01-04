import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

/**
 * Email to send
 */
export interface EmailNotification extends Timestamps {
	_id: ObjectId;

	subject: string;
	htmlContent: string;

	error?: {
		message: string;
		stack?: string;
	};

	dest: string;
	cc?: string;

	processedAt?: Date;
}
