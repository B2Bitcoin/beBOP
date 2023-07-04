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
			: actualCurrency;

	$: displayed =
		displayedAmount.toLocaleString('en', {
			style: displayedCurrency === 'SAT' || displayedCurrency === 'BTC' ? undefined : 'currency',
			currency:
				displayedCurrency === 'SAT' || displayedCurrency === 'BTC' ? undefined : displayedCurrency,
			maximumFractionDigits: displayedCurrency === 'BTC' ? 8 : 2,
			minimumFractionDigits: 0
		}) + (displayedCurrency === 'SAT' && !short ? ' SAT' : '');
</script>

<div
	class="{className} flex {gap} items-center"
	title={displayed +
		(convertedTo ? `, exchange rate: ${exchangeRate} ${convertedTo} per ${currency}` : '')}
>
	{#if displayedCurrency === 'SAT'}
		<IconSatoshi class="min-w-[1em]" />
	{:else if displayedCurrency === 'BTC'}
		<IconBitcoin class="min-w-[1em]" />
	{/if}

	{displayed}
</div>
