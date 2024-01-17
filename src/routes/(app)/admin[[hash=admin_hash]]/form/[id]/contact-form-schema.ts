import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
import { z } from 'zod';

export const contactFormTranslatableSchema = {
	content: z.string().max(MAX_CONTENT_LIMIT),
	subject: z.string().max(100)
};
