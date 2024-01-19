import { MAX_DESCRIPTION_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
import { z } from 'zod';

export const countdownTranslatableSchema = {
	description: z.string().trim().min(1).max(MAX_DESCRIPTION_LIMIT),
	title: z.string().trim().min(1).max(MAX_SHORT_DESCRIPTION_LIMIT)
};
