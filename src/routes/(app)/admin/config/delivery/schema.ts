import { COUNTRY_ALPHA3S } from '$lib/types/Country';
import { CURRENCIES } from '$lib/types/Currency';
import { z } from 'zod';

export const deliveryFeesSchema = z.record(
	z.enum(['default', ...COUNTRY_ALPHA3S]),
	z.object({
		amount: z.number({ coerce: true }).min(0),
		currency: z.enum([CURRENCIES[0], ...CURRENCIES.slice(1)])
	})
);
