<script lang="ts">
	import type { CountryAlpha2 } from '$lib/types/Country';
	import { CURRENCIES, type Currency } from '$lib/types/Currency';
	import { typedEntries } from '$lib/utils/typedEntries';
	import type { DeliveryFees } from '$lib/types/DeliveryFees';
	import { useI18n } from '$lib/i18n';

	export let deliveryFees: DeliveryFees = {};
	export let defaultCurrency: Currency;
	export let disabled = false;

	let feeCountryToAdd: CountryAlpha2 | 'default' = 'default';

	const { countryName, sortedCountryCodes } = useI18n();

	$: countriesWithNoFee = ['default' as const, ...sortedCountryCodes()].filter(
		(country) => !deliveryFees[country]
	);
	$: feeCountryToAdd = countriesWithNoFee.includes(feeCountryToAdd)
		? feeCountryToAdd
		: countriesWithNoFee[0];
</script>

{#if countriesWithNoFee.length}
	<div class="checkbox-label">
		<select class="form-input max-w-[25rem]" {disabled} bind:value={feeCountryToAdd}>
			{#each countriesWithNoFee as country}
				<option value={country}>
					{country === 'default' ? 'Other countries' : countryName(country)}
				</option>
			{/each}
		</select>
		<button
			type="button"
			{disabled}
			on:click={() =>
				(deliveryFees[feeCountryToAdd] = structuredClone(deliveryFees.default) || {
					amount: 0,
					currency: defaultCurrency
				})}
			class="text-link underline"
		>
			Add fee option
		</button>
	</div>
{/if}

{#each typedEntries(deliveryFees) as [country, deliveryFee]}
	<div class="flex flex-col gap-2">
		<h3 class="text-xl">
			{country === 'default' ? 'Other countries' : countryName(country)}
		</h3>
		<div class="gap-4 flex flex-col md:flex-row">
			<label class="w-full">
				Amount
				<input
					class="form-input"
					type="number"
					{disabled}
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
				<select name="deliveryFees[{country}].currency" class="form-input" {disabled}>
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
			{disabled}
			on:click={() => {
				delete deliveryFees[country];
				deliveryFees = { ...deliveryFees };
			}}
		>
			Remove
		</button>
	</div>
{/each}
