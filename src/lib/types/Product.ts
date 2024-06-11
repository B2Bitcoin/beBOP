import type { LanguageKey } from '$lib/translations';
import type { ObjectId } from 'mongodb';
import type { Currency } from './Currency';
import type { DeliveryFees } from './DeliveryFees';
import type { Price } from './Order';
import type { ProductActionSettings } from './ProductActionSettings';
import type { Tag } from './Tag';
import type { Timestamps } from './Timestamps';
import type { PaymentMethod } from '$lib/server/payment-methods';

export interface ProductTranslatableFields {
	name: string;
	description: string;
	shortDescription: string;
	customPreorderText?: string;
	cta?: {
		label: string;
		href: string;
		fallback?: boolean;
	}[];
	contentBefore?: string;
	contentAfter?: string;
}

export interface Product extends Timestamps, ProductTranslatableFields {
	_id: string;
	alias: string[];
	price: {
		amount: number;
		currency: Currency;
	};
	stock?: {
		available: number;
		total: number;
		reserved: number;
	};
	vatProfileId?: ObjectId;
	maxQuantityPerOrder?: number;
	type: 'subscription' | 'resource' | 'donation';
	shipping: boolean;
	deliveryFees?: DeliveryFees;
	requireSpecificDeliveryFee?: boolean;
	applyDeliveryFeesOnlyOnce?: boolean;
	isTicket: boolean;
	availableDate?: Date;
	preorder: boolean;
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
	maximumPrice?: Price;
	translations?: Partial<Record<LanguageKey, Partial<ProductTranslatableFields>>>;
	/**
	 * The product can only be bought with the specified payment methods
	 */
	paymentMethods?: PaymentMethod[];
	mobile?: {
		hideContentBefore: boolean;
		hideContentAfter: boolean;
	};
}

export type BasicProductFrontend = Pick<Product, '_id' | 'price' | 'name'>;

export const MAX_NAME_LIMIT = 70;

export const MAX_SHORT_DESCRIPTION_LIMIT = 160;
export const MAX_DESCRIPTION_LIMIT = 10000;

export const DEFAULT_MAX_QUANTITY_PER_ORDER = 10;
export const POS_PRODUCT_PAGINATION = 10;

export function isPreorder(
	availableDate: Date | undefined,
	preorder: boolean | undefined
): boolean {
	return !!(preorder && availableDate && availableDate > new Date());
}

export function oneMaxPerLine(p: Pick<Product, 'standalone' | 'type'>) {
	return p.standalone || p.type === 'subscription';
}
