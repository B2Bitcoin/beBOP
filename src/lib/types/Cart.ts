import type { RuntimeConfig } from '$lib/server/runtime-config';
import { sum } from '$lib/utils/sum';
import { toCurrency } from '$lib/utils/toCurrency';
import type { ObjectId } from 'mongodb';
import { vatRate, type CountryAlpha2 } from './Country';
import { UNDERLYING_CURRENCY, type Currency } from './Currency';
import type { Product } from './Product';
import type { Timestamps } from './Timestamps';
import type { UserIdentifier } from './UserIdentifier';
import type { DiscountType, Price } from './Order';
import { sumCurrency } from '$lib/utils/sumCurrency';
import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding';
import { currencies } from '$lib/stores/currencies';
import { get } from 'svelte/store';
import { filterUndef } from '$lib/utils/filterUndef';

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

export function computePriceInfo(
	items: Array<{
		product: { shipping: boolean; price: Price };
		quantity: number;
		customPrice?: Price;
		depositPercentage?: number;
	}>,
	params: {
		vatExempted: boolean;
		vatNullOutsideSellerCountry: boolean;
		userCountry: CountryAlpha2 | undefined;
		bebopCountry: CountryAlpha2 | undefined;
		vatSingleCountry: boolean;
		deliveryFees: Price;
		discount?: {
			amount: number;
			type: DiscountType;
		} | null;
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
	discount: number;
	physicalVatCountry: CountryAlpha2 | undefined;
	digitalVatCountry: CountryAlpha2 | undefined;
	singleVatCountry: boolean;
	currency: Currency;
	/** Aggregate physical vat & digital vat when rates are the same or one is null */
	vat: Array<{
		price: Price;
		rate: number;
		country: CountryAlpha2;
	}>;
	/** Vat rate for each individual item */
	vatRates: number[];
} {
	const isPhysicalVatExempted =
		params.vatNullOutsideSellerCountry && params.bebopCountry !== params.userCountry;
	const singleVatCountry = params.vatSingleCountry && !!params.bebopCountry;
	const physicalVatCountry =
		params.vatExempted || isPhysicalVatExempted
			? undefined
			: params.vatSingleCountry
			? params.bebopCountry
			: params.userCountry ?? params.bebopCountry;
	const digitalVatCountry = params.vatExempted ? undefined : params.bebopCountry;
	const digitalVatRate = vatRate(digitalVatCountry);
	const physicalVatRate = vatRate(physicalVatCountry);

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
	const vatRates = items.map((item) => (item.product.shipping ? physicalVatRate : digitalVatRate));
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
	const digitalVat = sumCurrency(
		UNDERLYING_CURRENCY,
		items
			.filter((item) => !item.product.shipping)
			.map((item) => ({
				currency: (item.customPrice || item.product.price).currency,
				amount:
					(item.customPrice || item.product.price).amount * item.quantity * (digitalVatRate / 100)
			}))
	);
	const physicalVat = sumCurrency(UNDERLYING_CURRENCY, [
		...items
			.filter((item) => item.product.shipping)
			.map((item) => ({
				currency: (item.customPrice || item.product.price).currency,
				amount:
					(item.customPrice || item.product.price).amount *
					item.quantity *
					(item.depositPercentage ?? 100) *
					(physicalVatRate / 100)
			})),
		{
			amount: (params.deliveryFees.amount * physicalVatRate) / 100,
			currency: params.deliveryFees.currency
		}
	]);

	let totalPriceWithVat = totalPrice + totalVat;
	let partialPriceWithVat = partialPrice + partialVat;
	let discountAmount = 0;

	if (params.discount) {
		const oldTotalPriceWithVat = totalPriceWithVat;
		if (params.discount.type === 'percentage') {
			const discount = (totalPriceWithVat * params.discount.amount) / 100;
			totalPriceWithVat = fixCurrencyRounding(
				Math.max(totalPriceWithVat - discount, 0),
				UNDERLYING_CURRENCY
			);
		} else {
			totalPriceWithVat = Math.max(
				sumCurrency(UNDERLYING_CURRENCY, [
					{ amount: totalPriceWithVat, currency: UNDERLYING_CURRENCY },
					{ amount: -params.discount.amount, currency: get(currencies).main }
				]),
				0
			);
		}
		discountAmount = oldTotalPriceWithVat - totalPriceWithVat;
		if (discountAmount) {
			partialPriceWithVat = fixCurrencyRounding(
				Math.max(
					partialPriceWithVat - (discountAmount * partialPriceWithVat) / oldTotalPriceWithVat,
					0
				),
				UNDERLYING_CURRENCY
			);
		}
	}

	const vat: Array<{
		price: Price;
		rate: number;
		country: CountryAlpha2;
	}> = filterUndef([
		physicalVatCountry
			? {
					price: {
						amount: physicalVat,
						currency: UNDERLYING_CURRENCY satisfies Currency as Currency
					},
					rate: physicalVatRate,
					country: physicalVatCountry
			  }
			: undefined,
		digitalVatCountry
			? {
					price: {
						amount: digitalVat,
						currency: UNDERLYING_CURRENCY satisfies Currency as Currency
					},
					rate: digitalVatRate,
					country: digitalVatCountry
			  }
			: undefined
	]).filter((vat) => vat.price.amount > 0);

	if (
		vat.length === 2 &&
		vat[0].rate === vat[1].rate &&
		vat[0].country === vat[1].country &&
		vat[0].price.currency === vat[1].price.currency
	) {
		vat[0].price.amount += vat[1].price.amount;
		vat.pop();
	}

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
		partialPriceWithVat,
		digitalVatCountry,
		physicalVatCountry,
		singleVatCountry,
		currency: UNDERLYING_CURRENCY,
		discount: discountAmount,
		vat,
		vatRates
	};
}
