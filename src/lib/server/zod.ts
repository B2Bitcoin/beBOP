import { z } from 'zod';

export function zodObjectId() {
	return z.string().regex(/^[a-f0-9]{24}$/i);
}
