import { z } from 'zod';

export const galleryTranslatableSchema = {
	principal: z.object({
		title: z.string(),
		content: z.string().trim().max(10_000),
		cta: z.object({ href: z.string().trim(), label: z.string().trim() }).optional()
	}),
	secondary: z
		.array(
			z.object({
				title: z.string(),
				content: z.string().trim().max(10_000),
				pictureId: z.string().trim().max(500),
				cta: z.object({ href: z.string().trim(), label: z.string().trim() }).optional()
			})
		)
		.optional()
		.default([])
};
