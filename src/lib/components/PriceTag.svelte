<script lang="ts">
	import { SATOSHIS_PER_BTC, type Currency } from '$lib/types/Currency';
	import { toCurrency } from '$lib/utils/toCurrency';
	import IconBitcoin from './icons/IconBitcoin.svelte';
	import IconSatoshi from './icons/IconSatoshi.svelte';
	import { currencies } from '$lib/stores/currencies';

	export let amount: number;
	export let currency: Currency;
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

	const mainCurrency = $currencies.main;
	const secondaryCurrency = $currencies.secondary;

	$: actualCurrency = main ? mainCurrency : secondary ? secondaryCurrency : convertedTo ?? currency;
	$: actualAmount = actualCurrency === null ? 0 : toCurrency(actualCurrency, amount, currency);

	$: displayedAmount =
		actualCurrency === 'BTC' && actualAmount < 0.01
			? actualAmount * SATOSHIS_PER_BTC
			: actualCurrency === 'SAT' && actualAmount >= 1_000_000
			? actualAmount / SATOSHIS_PER_BTC
			: actualAmount;
	$: displayedCurrency =
		actualCurrency === 'BTC' && actualAmount < 0.01
			? 'SAT'
			: actualCurrency === 'SAT' && actualAmount >= 1_000_000
			? 'BTC'
			: actualCurrency || 'BTC';

	$: displayed =
		displayedCurrency !== 'BTC' && actualAmount > 0 && displayedAmount < 0.01
			? '< ' +
			  Number(0.01).toLocaleString('en', {
					style: displayedCurrency === 'SAT' ? undefined : 'currency',
					currency: displayedCurrency === 'SAT' ? undefined : displayedCurrency,
					maximumFractionDigits: 2,
					minimumFractionDigits: 0
			  })
			: displayedAmount.toLocaleString('en', {
					style:
						displayedCurrency === 'SAT' || displayedCurrency === 'BTC' ? undefined : 'currency',
					currency:
						displayedCurrency === 'SAT' || displayedCurrency === 'BTC'
							? undefined
							: displayedCurrency,
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
