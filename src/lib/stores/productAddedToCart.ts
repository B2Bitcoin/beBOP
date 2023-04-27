import type { Picture } from '$lib/types/Picture';
import type { BasicProductFrontend } from '$lib/types/Product';
import { writable } from 'svelte/store';

export const productAddedToCart = writable<{
	product: BasicProductFrontend;
	picture: Picture;
	quantity: number;
} | null>(null);
