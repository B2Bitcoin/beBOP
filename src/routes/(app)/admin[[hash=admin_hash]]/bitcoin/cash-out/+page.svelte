<script lang="ts">
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { currencies } from '$lib/stores/currencies';
	import { pick } from 'lodash-es';

	export let data;

	let cashoutAmount = 0;

	$: fees = cashoutAmount * 0.008;
	$: total = cashoutAmount - fees;
	$: remaining = data.balance - cashoutAmount;
</script>

<h1 class="text-3xl">Bitcoin node - Bity cash out</h1>

<h2 class="text-2xl">Balance</h2>

<PriceTag amount={data.balance} currency="BTC" force />
<PriceTag amount={data.balance} convertedTo="SAT" force currency="BTC" />

{#if $currencies.priceReference !== 'BTC' && $currencies.priceReference !== 'SAT'}
	<PriceTag amount={data.balance} convertedTo={$currencies.priceReference} currency="BTC" />
{/if}

<h2 class="text-2xl">Current exchange rate</h2>

<pre>{JSON.stringify(
		pick(data.exchangeRate, ['BTC_CHF', 'BTC_EUR', 'BTC_USD']),
		null,
		'\t'
	).replaceAll(/[\t{}]/g, '')}</pre>

<h2 class="text-2xl">Cash-out amount (BTC)</h2>

<input type="number" class="form-input" bind:value={cashoutAmount} />

<h2 class="text-2xl">Billing currency estimation</h2>

<p>
	Selected amount: <PriceTag
		amount={cashoutAmount}
		currency="BTC"
		class="inline-flex font-bold"
		convertedTo={$currencies.priceReference}
	/>
</p>

<p>
	Conversion fees will be applied, and bitcoin volatility may cause the final amount to be
	different. This is an estimation.
</p>

<p>
	Estimated fees: <PriceTag
		amount={-fees}
		currency="BTC"
		convertedTo={$currencies.priceReference}
		class="inline-flex font-bold"
	/> (0.8%)
</p>

<p>
	Total amount, fees deducted: <PriceTag
		amount={total}
		currency="BTC"
		convertedTo={$currencies.priceReference}
		class="inline-flex font-bold"
	/>
</p>

<h2 class="text-2xl">Remaining balance after withdrawal</h2>

<PriceTag amount={remaining} currency="BTC" force />
<PriceTag amount={remaining} convertedTo="SAT" force currency="BTC" />

{#if $currencies.priceReference !== 'BTC' && $currencies.priceReference !== 'SAT'}
	<PriceTag amount={remaining} convertedTo={$currencies.priceReference} currency="BTC" />
{/if}

<div class="flex justify-between">
	<button class="btn btn-orange">Request cashout</button>
	<a href="{data.adminPrefix}/bitcoin" class="btn btn-gray">Cancel</a>
</div>
