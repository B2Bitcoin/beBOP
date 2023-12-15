import { z } from 'zod';

export const tagTranslatableSchema = {
	content: z.string().trim().max(10_000),
	shortContent: z.string().trim().max(1_000),
	title: z.string(),
	subtitle: z.string(),
	ctaLinks: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional(),
	menuLinks: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional()
};
