<script lang="ts">
	import { COUNTRIES, COUNTRY_ALPHA3S, type CountryAlpha3 } from '$lib/types/Country';
	import { CURRENCIES } from '$lib/types/Currency';
	import { typedEntries } from '$lib/utils/typedEntries.js';

	export let data;
	export let form;

	let mode: 'flatFee' | 'perItem' = data.deliveryFees.mode;
	let onlyPayHighest = data.deliveryFees.onlyPayHighest;

	let fees = data.deliveryFees.fees;

	let feeCountryToAdd: CountryAlpha3 | 'default' = 'default';

	$: countriesWithNoFee = ['default' as const, ...COUNTRY_ALPHA3S].filter(
		(country) => !fees[country]
	);
	$: feeCountryToAdd = countriesWithNoFee.includes(feeCountryToAdd)
		? feeCountryToAdd
		: countriesWithNoFee[0];

	export const snapshot = {
		capture: () => ({ flatFees: fees, mode }),
		restore: (value) => {
			if (form?.success) {
				return;
			}
			fees = value.flatFees;
			mode = value.mode;
		}
	};
</script>

{#if form?.success}
	<p class="alert-success">Values updated</p>
{/if}

<h1 class="text-3xl">Delivery fees config</h1>

<form method="post" class="flex flex-col gap-4">
	<label class="checkbox-label">
		<input type="radio" bind:group={mode} class="form-radio" name="mode" value="flatFee" />
		Flat fee
	</label>

	<label class="checkbox-label">
		<input type="radio" bind:group={mode} class="form-radio" name="mode" value="perItem" />
		Fee depending on product
	</label>

	<h2 class="text-2xl">
		{mode === 'flatFee' ? 'Flat fee config' : 'Product delivery fees'}
	</h2>

	{#if mode === 'perItem'}
		<p class="alert-info">
			Those delivery fees will be applied to your products, unless overriden inside the product
			itself.
		</p>

		<label class="checkbox-label">
			<input type="checkbox" class="form-checkbox" name="onlyPayHighest" checked={onlyPayHighest} />
			For orders with multiple products, only apply the delivery fee of the product with the highest
			delivery fee
		</label>
	{/if}

	{#if countriesWithNoFee.length}
		<div class="checkbox-label">
			<select class="form-input max-w-[25rem]" bind:value={feeCountryToAdd}>
				{#each countriesWithNoFee as country}
					<option value={country}>{country === 'default' ? 'default' : COUNTRIES[country]}</option>
				{/each}
			</select>
			<button
				type="button"
				on:click={() =>
					(fees[feeCountryToAdd] = structuredClone(fees.default) || {
						amount: 0,
						currency: data.priceReferenceCurrency
					})}
				class="text-link underline"
			>
				Add flat fee option
			</button>
		</div>
	{/if}

	{#each typedEntries(fees) as [country, fee]}
		<div class="flex flex-col gap-2">
			<h3 class="text-xl">{country === 'default' ? 'Default value' : COUNTRIES[country]}</h3>
			<div class="gap-4 flex flex-col md:flex-row">
				<label class="w-full">
					Amount
					<input
						class="form-input"
						type="number"
						name="fees[{country}].amount"
						placeholder="Price"
						step="any"
						value={fee?.amount.toLocaleString('en', { maximumFractionDigits: 8 }).replace(/,/g, '')}
						required
					/>
				</label>

				<label class="w-full">
					Currency
					<select name="fees[{country}].currency" class="form-input">
						{#each CURRENCIES as currency}
							<option value={currency} selected={fee?.currency === currency}>
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
					delete fees[country];
					fees = { ...fees };
				}}
			>
				Remove
			</button>
		</div>
	{/each}

	<button type="submit" class="btn btn-black self-start"> Save config </button>
</form>
