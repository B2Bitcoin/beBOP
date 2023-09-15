import { writable } from 'svelte/store';
import type { LayoutData } from '../../routes/(app)/$types';

export const currencies = writable<LayoutData['currencies']>({
	main: 'BTC',
	secondary: 'EUR',
	priceReference: 'SAT'
});
