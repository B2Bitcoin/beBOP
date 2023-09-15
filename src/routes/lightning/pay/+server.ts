import { isLightningConfigured, lndCreateInvoice } from '$lib/server/lightning';
import { runtimeConfig } from '$lib/server/runtime-config';
import { SATOSHIS_PER_BTC } from '$lib/types/Currency';
import { error } from '@sveltejs/kit';
import { jwtVerify } from 'jose';
import { z } from 'zod';

export const OPTIONS = () => {
	return new Response(null, {
		headers: {
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'GET, HEAD, OPTIONS',
			'access-control-allow-headers': 'Accept, Accept-Language, Content-Language, Content-Type'
		}
	});
};

export const GET = async ({ url }) => {
	if (!isLightningConfigured) {
		throw error(400, 'Lightning is not configured');
	}

	const { amount, metadata: metadataJwt } = z
		.object({
			amount: z
				.number({ coerce: true })
				.int()
				.min(1)
				.max(SATOSHIS_PER_BTC * 1000),
			metadata: z.string()
		})
		.parse(Object.fromEntries(url.searchParams));

	const result = await jwtVerify(
		metadataJwt,
		Buffer.from(runtimeConfig.lnurlPayMetadataJwtSigningKey)
	);

	const { metadata } = z
		.object({
			metadata: z.string()
		})
		.parse(result.payload);

	const invoice = await lndCreateInvoice(amount, {
		descriptionHash: await crypto.subtle.digest('SHA-256', new TextEncoder().encode(metadata)),
		milliSatoshis: true
	});

	return new Response(
		JSON.stringify({
			pr: invoice.payment_request,
			routes: []
		}),
		{
			headers: {
				'content-type': 'application/json',
				'access-control-allow-origin': '*',
				'access-control-allow-methods': 'GET, HEAD, OPTIONS',
				'access-control-allow-headers': 'Accept, Accept-Language, Content-Language, Content-Type'
			}
		}
	);
};
