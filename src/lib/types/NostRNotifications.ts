import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';
import type { Kind } from 'nostr-tools';

/**
 * NostR message to send
 */
export interface NostRNotification extends Timestamps {
	_id: ObjectId;

	content: string;
	kind: Kind.EncryptedDirectMessage | Kind.Metadata;

	/**
	 * When kind is Kind.EncryptedDirectMessage, this is the recipient's pubkey
	 */
	dest?: string;

	/** When replying to someone, we may want to increase seconds by 1 in our reply */
	minCreatedAt?: Date;

	processedAt?: Date;
}
