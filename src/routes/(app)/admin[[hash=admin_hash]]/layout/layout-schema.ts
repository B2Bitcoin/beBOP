import { MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
import { z } from 'zod';

export const layoutTranslatableSchema = {
	brandName: z.string().min(1).trim().optional(),
	websiteTitle: z.string().min(1).trim().optional(),
	websiteShortDescription: z.string().min(1).max(MAX_SHORT_DESCRIPTION_LIMIT).trim().optional(),
	topbarLinks: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional(),
	footerLinks: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional(),
	navbarLinks: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional()
};
