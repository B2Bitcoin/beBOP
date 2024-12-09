<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency';
	import { toCurrency } from '$lib/utils/toCurrency';
	import type { Currency } from '$lib/types/Currency';

	$: firstCurrencyAmount = 1;
	$: firstCurrency = 'BTC' as Currency;
	$: secondCurrency = 'EUR' as Currency;
	$: secondCurrencyAmount = toCurrency(secondCurrency, firstCurrencyAmount, firstCurrency);
</script>

<div class="flex justify-center mx-auto max-w-3xl bg-gray-800 p-4 rounded-md">
	<div
		class="flex items-center bg-gray-900 text-white rounded-md focus-within:ring-2 focus-within:ring-blue-500 m-1"
	>
		<input
			type="number"
			class="form-input p-2 bg-transparent text-left text-white focus:outline-none"
			bind:value={firstCurrencyAmount}
			min="0"
		/>
		<select
			class="p-2 bg-gray-700 text-white border-l border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
			bind:value={firstCurrency}
		>
			{#each CURRENCIES as currency}
				<option value={currency} selected={currency === firstCurrency}>{currency}</option>
			{/each}
		</select>
	</div>

	<span class="text-gray-400 text-3xl m-1">→</span>

	<div
		class="flex items-center bg-gray-900 text-white rounded-md focus-within:ring-2 focus-within:ring-blue-500 m-1"
	>
		<input
			type="text"
			class="form-input p-2 bg-transparent text-left text-white focus:outline-none"
			bind:value={secondCurrencyAmount}
			readonly
		/>
		<select
			class="p-2 bg-gray-700 text-white border-l border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
			bind:value={secondCurrency}
		>
			{#each CURRENCIES as currency}
				<option value={currency} selected={currency === secondCurrency}>{currency}</option>
			{/each}
		</select>
	</div>
</div>
