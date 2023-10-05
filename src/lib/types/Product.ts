import type { Currency } from './Currency';
import type { DeliveryFees } from './DeliveryFees';
import type { Timestamps } from './Timestamps';

export interface Product extends Timestamps {
	_id: string;
	name: string;
	description: string;
	shortDescription: string;
	price: {
		amount: number;
		currency: Currency;
	};
	stock?: {
		available: number;
		total: number;
		reserved: number;
	};
	type: 'subscription' | 'resource' | 'donation';
	shipping: boolean;
	deliveryFees?: DeliveryFees;
	requireSpecificDeliveryFee?: boolean;
	applyDeliveryFeesOnlyOnce?: boolean;
	availableDate?: Date;
	preorder: boolean;
	displayShortDescription: boolean;
	payWhatYouWant: boolean;
	standalone: boolean;
	free: boolean;
}

export type BasicProductFrontend = Pick<Product, '_id' | 'price' | 'name'>;

export const MAX_NAME_LIMIT = 70;

export const MAX_SHORT_DESCRIPTION_LIMIT = 160;

export function isPreorder(
	availableDate: Date | undefined,
	preorder: boolean | undefined
): boolean {
	return !!(preorder && availableDate && availableDate > new Date());
}
