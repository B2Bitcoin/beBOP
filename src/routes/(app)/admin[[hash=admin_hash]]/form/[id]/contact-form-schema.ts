import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
import { z } from 'zod';

export const contactFormTranslatableSchema = {
	content: z.string().max(MAX_CONTENT_LIMIT).default(''),
	subject: z.string().max(100),
	disclaimer: z
		.object({
			label: z.string().min(1).max(100).trim(),
			content: z.string().max(MAX_CONTENT_LIMIT).trim(),
			checkboxLabel: z.string().min(1).max(100).trim()
		})
		.optional()
};
