import { z } from 'zod';

export const tagTranslatableSchema = {
	content: z.string().trim().max(10_000).optional(),
	shortContent: z.string().trim().max(1_000).optional(),
	title: z.string().optional(),
	subtitle: z.string().optional(),
	cta: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional(),
	menu: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional()
};
