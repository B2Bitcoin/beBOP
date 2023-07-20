import type { RuntimeConfig } from '$lib/server/runtime-config';
import { sum } from '$lib/utils/sum';
import { toCurrency } from '$lib/utils/toCurrency';
import type { CountryAlpha3 } from './Country';
import type { Currency } from './Currency';
import type { Product } from './Product';
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

export function computeDeliveryFees(
	currency: Currency,
	country: CountryAlpha3,
	items: Array<{ product: Pick<Product, 'price' | 'deliveryFees' | 'shipping'>; quantity: number }>,
	deliveryFeesConfig: RuntimeConfig['deliveryFees']
) {
	items = items.filter(({ product }) => product.shipping);

	const fees = items.map(({ product, quantity }) => {
		const cfg =
			product.deliveryFees?.[country] ||
			product.deliveryFees?.default ||
			deliveryFeesConfig.deliveryFees[country] ||
			deliveryFeesConfig.deliveryFees.default;

		if (!cfg) {
			return NaN;
		}

		return toCurrency(currency, cfg.amount, cfg.currency) * quantity;
	});

	if (fees.length === 0) {
		return 0;
	}

	if (fees.some((fee) => isNaN(fee))) {
		return NaN;
	}

	return sum(fees);
}
