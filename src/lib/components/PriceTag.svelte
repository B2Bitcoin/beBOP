<script lang="ts">
	import { SATOSHIS_PER_BTC, type Currency } from '$lib/types/Currency';
	import IconBitcoin from './icons/IconBitcoin.svelte';
	import IconSatoshi from './icons/IconSatoshi.svelte';

	export let amount: number;
	export let currency: Currency | 'SAT';
	export let exchangeRate = 0;
	export let rawBtc = false;
	export let convertedTo: Currency | undefined = undefined;
	export let short = true;
	export let gap = 'gap-2';

	let className = '';
	export { className as class };

	$: actualAmount = convertedTo ? amount * exchangeRate : amount;
	$: actualCurrency = convertedTo ?? currency;

	$: displayedAmount =
		actualCurrency === 'BTC' && !rawBtc ? actualAmount * SATOSHIS_PER_BTC : actualAmount;
	$: displayedCurrency = actualCurrency === 'BTC' && !rawBtc ? 'SAT' : actualCurrency;
</script>

<div
	class="{className} flex {gap} items-center"
	title={convertedTo ? `Exchange rate: ${exchangeRate} ${convertedTo} per ${currency}` : undefined}
>
	{#if displayedCurrency === 'SAT'}
		<IconSatoshi />
	{:else if displayedCurrency === 'BTC'}
		<IconBitcoin />
	{/if}

	{displayedAmount.toLocaleString('en', {
		style: displayedCurrency === 'SAT' || displayedCurrency === 'BTC' ? undefined : 'currency',
		currency:
			displayedCurrency === 'SAT' || displayedCurrency === 'BTC' ? undefined : displayedCurrency,
		maximumFractionDigits: displayedCurrency === 'BTC' ? 8 : 2,
		minimumFractionDigits: 0
	})}

	{#if displayedCurrency === 'SAT' && !short}
		<span>SAT</span>
	{/if}
</div>
