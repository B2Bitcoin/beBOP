import type { Product } from './Product';
import type { Currency } from './Currency';
import type { CountryAlpha2 } from './Country';
import type { Timestamps } from './Timestamps';
import type { UserIdentifier } from './UserIdentifier';
import type { SellerIdentity } from './SellerIdentity';
import type { PaymentMethod } from '$lib/server/payment-methods';
import type { ObjectId } from 'mongodb';
import { sumCurrency } from '$lib/utils/sumCurrency';
import type { LanguageKey } from '$lib/translations';
import type { User } from './User';

export type OrderPaymentStatus = 'pending' | 'paid' | 'expired' | 'canceled';

export type DiscountType = 'fiat' | 'percentage';

export type Price = {
	amount: number;
	currency: Currency;
};

export interface Note {
	npub?: string;
	email?: string;
	userId?: User['_id'];
	role: string; // CUSTOMER_ROLE_ID or other
	content: string;
	createdAt: Date;
}

export interface OrderPayment {
	_id: ObjectId;
	status: OrderPaymentStatus;
	price: Price;
	currencySnapshot: {
		main: {
			price: Price;
			previouslyPaid?: Price;
			remainingToPay?: Price;
		};
		priceReference: {
			price: Price;
			previouslyPaid?: Price;
			remainingToPay?: Price;
		};
		secondary?: {
			price: Price;
			previouslyPaid?: Price;
			remainingToPay?: Price;
		};
	};
	method: PaymentMethod;
	/**
	 * Can be unset for cash or bank transfer payments for example.
	 */
	expiresAt?: Date;
	/** Bitcoin / LN address, payment link */
	address?: string;
	paidAt?: Date;
	/** For lightning addresses, contains the hash to look up the invoice */
	invoiceId?: string;
	/** For card transactions */
	checkoutId?: string;
	/** For bitcoin transactions */
	wallet?: string;
	label?: string;
	/**
	 * There are also additional fields for sumup, they are stored but not documented here.
	 */
	transactions?: Array<{ id: string; amount: number; currency: Currency }>;

	/**
	 * The invoice number, set when the order is paid.
	 */
	invoice?: {
		number: number;
		createdAt: Date;
	};

	lastStatusNotified?: OrderPaymentStatus;
	bankTransferNumber?: string;
	sumupTransactionId?: string;
}

export interface OrderAddress {
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	state?: string;
	zip: string;
	country: CountryAlpha2;
}

export interface Order extends Timestamps {
	/**
	 * A string - a crypto UUID. Anyone having access to the _id can access the order.
	 */
	_id: string;

	number: number;
	locale: LanguageKey;

	items: Array<{
		product: Product;
		quantity: number;
		customPrice?: { amount: number; currency: Currency };
		depositPercentage?: number;
		currencySnapshot: {
			main: {
				price: Price;
				customPrice?: Price;
			};
			priceReference: {
				price: Price;
				customPrice?: Price;
			};
			secondary?: {
				price: Price;
				customPrice?: Price;
			};
		};
	}>;

	shippingAddress?: OrderAddress;
	billingAddress?: OrderAddress;
	shippingPrice?: {
		amount: number;
		currency: Currency;
	};

	vat?: {
		price: Price;
		rate: number;
		country: string;
	};

	vatFree?: {
		reason: string;
	};

	currencySnapshot: {
		main: {
			totalPrice: Price;
			totalReceived?: Price;
			vat?: Price;
			shippingPrice?: Price;
			discount?: Price;
		};
		priceReference: {
			totalPrice: Price;
			totalReceived?: Price;
			vat?: Price;
			shippingPrice?: Price;
			discount?: Price;
		};
		secondary?: {
			totalPrice: Price;
			totalReceived?: Price;
			vat?: Price;
			shippingPrice?: Price;
			discount?: Price;
		};
	};

	/**
	 * Global status, in case multiple payments are required for the order.
	 */
	status: OrderPaymentStatus;

	payments: OrderPayment[];

	sellerIdentity: SellerIdentity | null;

	notifications: {
		paymentStatus: {
			// One of these two must be set
			npub?: string;
			email?: string;
		};
	};

	user: UserIdentifier;

	discount?: {
		justification: string;
		type: DiscountType;
		price: Price;
	};

	clientIp?: string;
	notes?: Note[];
}
interface SimplifiedOrderPayment {
	id: string;
	method: PaymentMethod;
	status: OrderPaymentStatus;
}
interface SimplifiedOrderNotes {
	content: string;
	createdAt: Date;
}
export type SimplifiedOrder = Omit<Order, 'payments' | 'notes'> & {
	payments: SimplifiedOrderPayment[];
	notes: SimplifiedOrderNotes[];
};

export function orderAmountWithNoPaymentsCreated(
	order: Pick<Order, 'currencySnapshot'> & {
		payments: Pick<OrderPayment, 'currencySnapshot' | 'status'>[];
	}
): number {
	return (
		order.currencySnapshot.main.totalPrice.amount -
		sumCurrency(
			order.currencySnapshot.main.totalPrice.currency,
			order.payments
				.filter((payment) => payment.status === 'pending' || payment.status === 'paid')
				.map((payment) => payment.currencySnapshot.main.price)
		)
	);
}

export const PAYMENT_METHOD_EMOJI: Record<PaymentMethod, string> = {
	'bank-transfer': '🏦',
	card: '💳',
	'point-of-sale': '🛒',
	lightning: '⚡',
	bitcoin: '₿'
};
