import type { Timestamps } from './Timestamps';

export interface Cart extends Timestamps {
	sessionId: string;

	items: Array<{
		productId: string;
		quantity: number;
	}>;
}
