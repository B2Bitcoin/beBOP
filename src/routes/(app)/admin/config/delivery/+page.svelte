<script lang="ts">
	import DeliveryFeesSelector from '$lib/components/DeliveryFeesSelector.svelte';
	import { COUNTRIES, COUNTRY_ALPHA3S, type CountryAlpha3 } from '$lib/types/Country';

	export let data;
	export let form;

	let mode: 'flatFee' | 'perItem' = data.deliveryFees.mode;
	let onlyPayHighest = data.deliveryFees.onlyPayHighest;

	let deliveryFees = data.deliveryFees.deliveryFees || {};

	let feeCountryToAdd: CountryAlpha3 | 'default' = 'default';

	$: countriesWithNoFee = ['default' as const, ...COUNTRY_ALPHA3S].filter(
		(country) => !deliveryFees[country]
	);
	$: feeCountryToAdd = countriesWithNoFee.includes(feeCountryToAdd)
		? feeCountryToAdd
		: countriesWithNoFee[0];

	export const snapshot = {
		capture: () => ({ deliveryFees, mode }),
		restore: (value) => {
			if (form?.success) {
				return;
			}
			deliveryFees = value.deliveryFees || {};
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
					(deliveryFees[feeCountryToAdd] = structuredClone(deliveryFees.default) || {
						amount: 0,
						currency: data.priceReferenceCurrency
					})}
				class="text-link underline"
			>
				Add flat fee option
			</button>
		</div>
	{/if}

	<DeliveryFeesSelector {deliveryFees} />

	<button type="submit" class="btn btn-black self-start"> Save config </button>
</form>
