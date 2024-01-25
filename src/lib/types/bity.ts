import type { Currency } from '$lib/types/Currency';

export type BityAmount = {
	currency: Currency;
	amount: string;
};

export type BityPaymentMethod = 'bank_account' | 'online_instant_payment' | 'crypto_address';

export type BityEstimate = {
	input: BityAmount & {
		object_information_optional: boolean;
		type: BityPaymentMethod;
		minimum_amount: string;
	};
	output: {
		type: BityPaymentMethod;
	} & BityAmount;
	price_breakdown: {
		customer_trading_fee: BityAmount;
		output_transaction_cost: BityAmount;
		'non-verified_fee': BityAmount;
	};
};

export async function bityEstimate(params: {
	from: Currency;
	to: Currency;
	amount: number;
	paymentMethod?: BityPaymentMethod;
}): Promise<BityEstimate> {
	const response = await fetch('https://exchange.api.bity.com/v2/orders/estimate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			input: {
				currency: params.from,
				amount: String(params.amount),
				type: params.paymentMethod
			},
			output: {
				currency: params.to
			}
		}),
		...{ autoSelectFamily: true }
	});

	if (!response.ok) {
		throw new Error(await response.text());
	}

	const jsonResp: BityEstimate = await response.json();

	return jsonResp;
}
