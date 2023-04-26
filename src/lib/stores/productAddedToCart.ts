import type { Picture } from '$lib/types/Picture';
import type { ProductFrontend } from '$lib/types/Product';
import { writable } from 'svelte/store';

export const productAddedToCart = writable<{
	product: ProductFrontend;
	picture: Picture;
	quantity: number;
} | null>(null);
