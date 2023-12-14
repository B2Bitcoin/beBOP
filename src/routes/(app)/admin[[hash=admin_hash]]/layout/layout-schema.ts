import { z } from 'zod';

export const layoutTranslatableSchema = {
	brandName: z.string().min(1).trim().optional(),
	topbarLinks: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional(),
	footerLinks: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional(),
	navbarLinks: z.array(z.object({ href: z.string().trim(), label: z.string().trim() })).optional()
};
