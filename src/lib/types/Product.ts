import type { Currency } from './Currency';
import type { DeliveryFees } from './DeliveryFees';
import type { ProductActionSettings } from './ProductActionSettings';
import type { Tag } from './Tag';
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
	maxQuantityPerOrder?: number;
	type: 'subscription' | 'resource' | 'donation';
	shipping: boolean;
	deliveryFees?: DeliveryFees;
	requireSpecificDeliveryFee?: boolean;
	applyDeliveryFeesOnlyOnce?: boolean;
	availableDate?: Date;
	preorder: boolean;
	customPreorderText?: string;
	displayShortDescription: boolean;
	deposit?: {
		percentage: number;
		/**
		 * If this is true, the product can not be paid in full immediately
		 */
		enforce: boolean;
	};
	/**
	 * Setting this to true will also set standalone to true
	 */
	payWhatYouWant: boolean;
	/**
	 * One line per item in a cart, eg for large products
	 */
	standalone: boolean;
	free: boolean;
	actionSettings: ProductActionSettings;
	tagIds?: Tag['_id'][];
	cta?: {
		label: string;
		href: string;
	}[];
	contentBefore?: string;
	contentAfter?: string;
}

export type BasicProductFrontend = Pick<Product, '_id' | 'price' | 'name'>;

export const MAX_NAME_LIMIT = 70;

export const MAX_SHORT_DESCRIPTION_LIMIT = 160;

export const DEFAULT_MAX_QUANTITY_PER_ORDER = 10;

export function isPreorder(
	availableDate: Date | undefined,
	preorder: boolean | undefined
): boolean {
	return !!(preorder && availableDate && availableDate > new Date());
}

export function oneMaxPerLine(p: Pick<Product, 'standalone' | 'type'>) {
	return p.standalone || p.type === 'subscription';
}
