import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { z } from 'zod';

export const labelTranslatableSchema = {
	name: z.string().max(MAX_NAME_LIMIT)
};
