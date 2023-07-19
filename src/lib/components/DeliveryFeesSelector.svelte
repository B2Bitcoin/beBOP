<script lang="ts">
	import { COUNTRIES, type CountryAlpha3 } from '$lib/types/Country';
	import { CURRENCIES, type Currency } from '$lib/types/Currency';
	import { typedEntries } from '$lib/utils/typedEntries';

	export let deliveryFees: Partial<
		Record<CountryAlpha3 | 'default', { amount: number; currency: Currency }>
	> = {};
</script>

{#each typedEntries(deliveryFees) as [country, deliveryFee]}
	<div class="flex flex-col gap-2">
		<h3 class="text-xl">{country === 'default' ? 'Default value' : COUNTRIES[country]}</h3>
		<div class="gap-4 flex flex-col md:flex-row">
			<label class="w-full">
				Amount
				<input
					class="form-input"
					type="number"
					name="deliveryFees[{country}].amount"
					placeholder="Price"
					step="any"
					value={deliveryFee?.amount
						.toLocaleString('en', { maximumFractionDigits: 8 })
						.replace(/,/g, '')}
					required
				/>
			</label>

			<label class="w-full">
				Currency
				<select name="deliveryFees[{country}].currency" class="form-input">
					{#each CURRENCIES as currency}
						<option value={currency} selected={deliveryFee?.currency === currency}>
							{currency}
						</option>
					{/each}
				</select>
			</label>
		</div>
		<button
			type="button"
			class="text-red-500 underline text-left"
			on:click={() => {
				delete deliveryFees[country];
				deliveryFees = { ...deliveryFees };
			}}
		>
			Remove
		</button>
	</div>
{/each}
