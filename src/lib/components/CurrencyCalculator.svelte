<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency';
	import { toCurrency } from '$lib/utils/toCurrency';
	import type { Currency } from '$lib/types/Currency';

	$: firstDeviseValue = 1;
	$: firstDevise = 'BTC' as Currency;
	$: secondDevise = 'EUR' as Currency;
	$: secondDeviseValue = toCurrency(secondDevise, firstDeviseValue, firstDevise);
</script>

<div class="flex justify-center mx-auto max-w-3xl bg-gray-800 p-4 rounded-md">
	<div
		class="flex items-center bg-gray-900 text-white rounded-md focus-within:ring-2 focus-within:ring-blue-500 m-1"
	>
		<input
			type="number"
			class="form-input p-2 bg-transparent text-left text-white focus:outline-none"
			bind:value={firstDeviseValue}
			min="0"
		/>
		<select
			class="p-2 bg-gray-700 text-white border-l border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
			bind:value={firstDevise}
		>
			{#each CURRENCIES as currency}
				<option value={currency} selected={currency === firstDevise}>{currency}</option>
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
			bind:value={secondDeviseValue}
			readonly
		/>
		<select
			class="p-2 bg-gray-700 text-white border-l border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
			bind:value={secondDevise}
		>
			{#each CURRENCIES as currency}
				<option value={currency} selected={currency === secondDevise}>{currency}</option>
			{/each}
		</select>
	</div>
</div>
