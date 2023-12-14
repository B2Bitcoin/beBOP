import { CURRENCIES } from '$lib/types/Currency';
import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
import { z } from 'zod';
import { deliveryFeesSchema } from '../config/delivery/schema';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';

export const productBaseSchema = {
	name: z.string().trim().min(1).max(MAX_NAME_LIMIT),
	description: z.string().trim().max(10_000),
	shortDescription: z.string().trim().max(MAX_SHORT_DESCRIPTION_LIMIT),
	priceAmount: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.default('0'),
	priceCurrency: z.enum([CURRENCIES[0], ...CURRENCIES.slice(1)]),
	availableDate: z.date({ coerce: true }).optional(),
	preorder: z.boolean({ coerce: true }).default(false),
	customPreorderText: z.string().trim().max(1_000).min(1).optional(),
	shipping: z.boolean({ coerce: true }).default(false),
	displayShortDescription: z.boolean({ coerce: true }).default(false),
	deliveryFees: deliveryFeesSchema.optional(),
	applyDeliveryFeesOnlyOnce: z.boolean({ coerce: true }).default(false),
	requireSpecificDeliveryFee: z.boolean({ coerce: true }).default(false),
	payWhatYouWant: z.boolean({ coerce: true }).default(false),
	standalone: z.boolean({ coerce: true }).default(false),
	free: z.boolean({ coerce: true }).default(false),
	stock: z.number({ coerce: true }).int().min(0).optional(),
	maxQuantityPerOrder: z.number({ coerce: true }).int().min(1).max(10).optional(),
	eshopVisible: z.boolean({ coerce: true }).default(false),
	retailVisible: z.boolean({ coerce: true }).default(false),
	googleShoppingVisible: z.boolean({ coerce: true }).default(false),
	eshopBasket: z.boolean({ coerce: true }).default(false),
	retailBasket: z.boolean({ coerce: true }).default(false),
	depositPercentage: z.number({ coerce: true }).int().min(0).max(100).optional(),
	enforceDeposit: z.boolean({ coerce: true }).default(false),
	ctaLinks: z
		.array(z.object({ href: z.string().trim(), label: z.string().trim() }))
		.optional()
		.default([]),
	contentBefore: z.string().max(MAX_CONTENT_LIMIT).default(''),
	contentAfter: z.string().max(MAX_CONTENT_LIMIT).default('')
};
