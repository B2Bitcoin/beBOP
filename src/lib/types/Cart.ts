import type { RuntimeConfig } from '$lib/server/runtime-config';
import { sum } from '$lib/utils/sum';
import { toCurrency } from '$lib/utils/toCurrency';
import type { ObjectId } from 'mongodb';
import { vatRate, type CountryAlpha2 } from './Country';
import { UNDERLYING_CURRENCY, type Currency } from './Currency';
import type { Product } from './Product';
import type { Timestamps } from './Timestamps';
import type { UserIdentifier } from './UserIdentifier';
import type { Price } from './Order';
import { sumCurrency } from '$lib/utils/sumCurrency';

export interface Cart extends Timestamps {
	_id: ObjectId;
	user: UserIdentifier;

	items: Array<{
		productId: string;
		quantity: number;
		customPrice?: { amount: number; currency: Currency };
		reservedUntil?: Date;
		depositPercentage?: number;
	}>;
}

export function computeDeliveryFees(
	currency: Currency,
	country: CountryAlpha2,
	items: Array<{
		product: Pick<
			Product,
			| 'price'
			| 'deliveryFees'
			| 'applyDeliveryFeesOnlyOnce'
			| 'shipping'
			| 'requireSpecificDeliveryFee'
		>;
		quantity: number;
	}>,
	deliveryFeesConfig: RuntimeConfig['deliveryFees']
) {
	items = items.filter(({ product }) => product.shipping);

	if (!items.length) {
		return 0;
	}

	if (deliveryFeesConfig.mode === 'flatFee' && !deliveryFeesConfig.applyFlatFeeToEachItem) {
		const cfg = deliveryFeesConfig.deliveryFees[country] || deliveryFeesConfig.deliveryFees.default;

		if (!cfg) {
			return NaN;
		}

		return toCurrency(currency, cfg.amount, cfg.currency);
	}

	const fees = items.map(({ product, quantity }) => {
		const cfg = (() => {
			const defaultConfig =
				deliveryFeesConfig.deliveryFees[country] || deliveryFeesConfig.deliveryFees.default;
			if (deliveryFeesConfig.mode === 'flatFee') {
				return defaultConfig;
			}

			let cfg = product.deliveryFees?.[country] || product.deliveryFees?.default;

			if (!product.requireSpecificDeliveryFee) {
				cfg ||= defaultConfig;
			}

			return cfg;
		})();

		if (!cfg) {
			return NaN;
		}

		return (
			toCurrency(currency, cfg.amount, cfg.currency) *
			(product.applyDeliveryFeesOnlyOnce ? 1 : quantity)
		);
	});

	if (fees.some((fee) => isNaN(fee))) {
		return NaN;
	}

	return deliveryFeesConfig.onlyPayHighest ? Math.max(...fees) : sum(fees);
}

export function computeVatInfo(
	items: Array<{
		product: { shipping: boolean; price: Price };
		quantity: number;
		customPrice?: Price;
		depositPercentage?: number;
	}>,
	params: {
		vatExempted: boolean;
		vatNullOutsideSellerCountry: boolean;
		userCountry: string | undefined;
		bebopCountry: string;
		vatSingleCountry: boolean;
		deliveryFees: Price;
	}
): {
	digitalVatRate: number;
	physicalVatRate: number;
	isPhysicalVatExempted: boolean;
	partialPrice: number;
	partialVat: number;
	partialPhysicalVat: number;
	partialDigitalVat: number;
	totalPrice: number;
	totalVat: number;
	totalPriceWithVat: number;
	partialPriceWithVat: number;
} {
	const digitalVatRate = params.vatExempted
		? 0
		: vatRate(
				params.vatSingleCountry ? params.bebopCountry : params.userCountry ?? params.bebopCountry
		  );
	const isPhysicalVatExempted =
		params.vatNullOutsideSellerCountry && params.bebopCountry !== params.userCountry;
	const physicalVatRate =
		params.vatExempted || isPhysicalVatExempted
			? 0
			: vatRate(
					params.vatSingleCountry ? params.bebopCountry : params.userCountry ?? params.bebopCountry
			  );

	const partialPrice = sumCurrency(UNDERLYING_CURRENCY, [
		...items.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount:
				((item.customPrice || item.product.price).amount *
					item.quantity *
					(item.depositPercentage ?? 100)) /
				100
		})),
		params.deliveryFees
	]);
	const partialVat = sumCurrency(UNDERLYING_CURRENCY, [
		...items.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount:
				((item.customPrice || item.product.price).amount *
					item.quantity *
					(item.depositPercentage ?? 100) *
					((item.product.shipping ? physicalVatRate : digitalVatRate) / 100)) /
				100
		})),
		{
			amount: (params.deliveryFees.amount * physicalVatRate) / 100,
			currency: params.deliveryFees.currency
		}
	]);
	const partialPhysicalVat = sumCurrency(UNDERLYING_CURRENCY, [
		...items
			.filter((item) => item.product.shipping)
			.map((item) => ({
				currency: (item.customPrice || item.product.price).currency,
				amount:
					((item.customPrice || item.product.price).amount *
						item.quantity *
						(item.depositPercentage ?? 100) *
						(physicalVatRate / 100)) /
					100
			})),
		{
			amount: (params.deliveryFees.amount * physicalVatRate) / 100,
			currency: params.deliveryFees.currency
		}
	]);
	const partialDigitalVat = sumCurrency(
		UNDERLYING_CURRENCY,
		items
			.filter((item) => !item.product.shipping)
			.map((item) => ({
				currency: (item.customPrice || item.product.price).currency,
				amount:
					((item.customPrice || item.product.price).amount *
						item.quantity *
						(item.depositPercentage ?? 100) *
						(digitalVatRate / 100)) /
					100
			}))
	);
	const totalPrice = sumCurrency(UNDERLYING_CURRENCY, [
		...items.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount: (item.customPrice || item.product.price).amount * item.quantity
		})),
		params.deliveryFees
	]);
	const totalVat = sumCurrency(UNDERLYING_CURRENCY, [
		...items.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount:
				(item.customPrice || item.product.price).amount *
				item.quantity *
				((item.product.shipping ? physicalVatRate : digitalVatRate) / 100)
		})),
		{
			amount: (params.deliveryFees.amount * physicalVatRate) / 100,
			currency: params.deliveryFees.currency
		}
	]);
	const totalPriceWithVat = totalPrice + totalVat;
	const partialPriceWithVat = partialPrice + partialVat;

	return {
		digitalVatRate,
		physicalVatRate,
		isPhysicalVatExempted,
		partialPrice,
		partialVat,
		partialPhysicalVat,
		partialDigitalVat,
		totalPrice,
		totalVat,
		totalPriceWithVat,
		partialPriceWithVat
	};
}
