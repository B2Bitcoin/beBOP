<script lang="ts">
	import { SATOSHIS_PER_BTC, type Currency } from '$lib/types/Currency';
	import IconSatoshi from './icons/IconSatoshi.svelte';

	export let amount: number;
	export let currency: Currency;
	export let exchangeRate = 0;
	export let convertedTo: Currency | undefined = undefined;
	export let short = false;
	export let gap = 'gap-2';

	let className = '';
	export { className as class };

	$: actualAmount = convertedTo ? amount * exchangeRate : amount;
	$: actualCurrency = convertedTo ?? currency;

	$: displayedAmount = actualCurrency === 'BTC' ? actualAmount * SATOSHIS_PER_BTC : actualAmount;
	$: displayedCurrency = actualCurrency === 'BTC' ? 'SAT' : actualCurrency;
</script>

<div class="{className} flex {gap} items-center">
	{#if displayedCurrency === 'SAT'}
		<IconSatoshi />
	{/if}

	{displayedAmount.toLocaleString('en', {
		style: displayedCurrency === 'SAT' ? undefined : 'currency',
		currency: displayedCurrency === 'SAT' ? undefined : displayedCurrency,
		maximumFractionDigits: 2,
		minimumFractionDigits: 0
	})}

	{#if displayedCurrency === 'SAT' && !short}
		<span>SAT</span>
	{/if}
</div>
