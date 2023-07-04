import type { Timestamps } from './Timestamps';

export interface Cart extends Timestamps {
	sessionId?: string;
	npub?: string;

	items: Array<{
		productId: string;
		quantity: number;
	}>;
}

export const MAX_PRODUCT_QUANTITY = 100;
