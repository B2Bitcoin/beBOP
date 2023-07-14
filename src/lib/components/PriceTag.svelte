<script lang="ts">
	import { SATOSHIS_PER_BTC, type Currency } from '$lib/types/Currency';
	import { toCurrency } from '$lib/utils/toCurrency';
	import { getContext } from 'svelte';
	import IconBitcoin from './icons/IconBitcoin.svelte';
	import IconSatoshi from './icons/IconSatoshi.svelte';
	import type { LayoutData } from '../../routes/(app)/$types';

	export let amount: number;
	export let currency: Currency;
	export let rawBtc = false;
	export let convertedTo: Currency | undefined = undefined;
	/**
	 * Convert to the main currency
	 */
	export let main = false;
	/**
	 * Convert to the secondary currency
	 */
	export let secondary = false;
	export let short = true;
	export let gap = 'gap-2';

	let className = '';
	export { className as class };

	const mainCurrency = getContext<LayoutData['mainCurrency']>('mainCurrency');
	const secondaryCurrency = getContext<LayoutData['secondaryCurrency']>('secondaryCurrency');

	$: actualCurrency = main ? mainCurrency : secondary ? secondaryCurrency : convertedTo ?? currency;
	$: actualAmount = actualCurrency === null ? 0 : toCurrency(actualCurrency, amount, currency);

	$: displayedAmount =
		actualCurrency === 'BTC' && !rawBtc && amount < 0.01
			? actualAmount * SATOSHIS_PER_BTC
			: actualCurrency === 'SAT' && amount >= 1_000_000
			? actualAmount / SATOSHIS_PER_BTC
			: actualAmount;
	$: displayedCurrency =
		actualCurrency === 'BTC' && !rawBtc && amount < 0.01
			? 'SAT'
			: actualCurrency === 'SAT' && amount >= 1_000_000
			? 'BTC'
			: actualCurrency || 'BTC';

	$: displayed =
		displayedAmount.toLocaleString('en', {
			style: displayedCurrency === 'SAT' || displayedCurrency === 'BTC' ? undefined : 'currency',
			currency:
				displayedCurrency === 'SAT' || displayedCurrency === 'BTC' ? undefined : displayedCurrency,
			maximumFractionDigits: displayedCurrency === 'BTC' ? 8 : 2,
			minimumFractionDigits: 0
		}) + (displayedCurrency === 'SAT' && !short ? ' SAT' : '');
</script>

{#if actualCurrency}
	<div class="{className} flex {gap} items-center" title={displayed}>
		{#if displayedCurrency === 'SAT'}
			<IconSatoshi class="min-w-[1em]" />
		{:else if displayedCurrency === 'BTC'}
			<IconBitcoin class="min-w-[1em]" />
		{/if}

		{displayed}
	</div>
{/if}
