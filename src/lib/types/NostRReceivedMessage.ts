import type { Kind } from 'nostr-tools';
import type { Timestamps } from './Timestamps';

export interface NostRReceivedMessage extends Timestamps {
	_id: string;

	content: string;
	source: string;

	kind: Kind;
}
