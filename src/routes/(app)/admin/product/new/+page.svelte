<script lang="ts">
	import { CURRENCIES, SATOSHIS_PER_BTC } from '$lib/types/Currency';
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays } from 'date-fns';

	let type = 'resource';
	let availableDate: string | undefined = undefined;
	let shipping = false;
	let preorder = false;
	let displayShortDescription = false;

	let priceAmount: number;
	let priceAmountElement: HTMLInputElement;

	export let data;

	$: enablePreorder = availableDate && availableDate > new Date().toJSON().slice(0, 10);

	$: if (!enablePreorder) {
		preorder = false;
	}

	$: if (!availableDate || type !== 'resource') {
		availableDate = undefined;
	}

	function checkForm(event: SubmitEvent) {
		if (priceAmountElement.value && priceAmount < 1 / SATOSHIS_PER_BTC) {
			priceAmountElement.setCustomValidity('Price must be greater than 1 SAT');
			priceAmountElement.reportValidity();
			event.preventDefault();
			return;
		} else {
			priceAmountElement.setCustomValidity('');
		}
	}
</script>

<h1 class="text-3xl">Add a product</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4" on:submit={checkForm}>
	<label>
		Product name
		<input
			class="form-input block"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="name"
			placeholder="Product name"
			required
		/>
	</label>

	<div class="gap-4 flex flex-col md:flex-row">
		<label class="w-full">
			Price amount
			<input
				class="form-input"
				type="number"
				name="priceAmount"
				placeholder="Price"
				step="any"
				bind:value={priceAmount}
				bind:this={priceAmountElement}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				required
			/>
		</label>

		<label class="w-full">
			Price currency

			<select name="priceCurrency" class="form-input">
				{#each CURRENCIES as currency}
					<option value={currency} selected={data.currency === currency}>{currency}</option>
				{/each}
			</select>
		</label>
	</div>

	<label>
		Short description
		<textarea
			name="shortDescription"
			cols="30"
			rows="2"
			maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
			class="form-input block w-full"
		/>
	</label>

	<label class="flex gap-2 items-center cursor-pointer">
		<input
			class="form-checkbox rounded-sm cursor-pointer"
			type="checkbox"
			name="displayShortDescription"
			bind:checked={displayShortDescription}
		/>
		Display the short description on product page
	</label>

	<label class="block w-full mt-4">
		Description
		<textarea
			name="description"
			cols="30"
			rows="10"
			maxlength="10000"
			class="form-input block w-full"
		/>
	</label>

	<label>
		Type
		<select class="form-input" bind:value={type} name="type">
			{#each ['resource', 'donation', 'subscription'] as type}
				<option value={type}>{upperFirst(type)}</option>
			{/each}
		</select>
	</label>

	{#if type === 'resource'}
		<div class="flex flex-wrap gap-4">
			<label>
				Available date

				<input
					class="form-input"
					type="date"
					name="availableDate"
					bind:value={availableDate}
					min={addDays(new Date(), 1).toJSON().slice(0, 10)}
				/>
				<span class="text-sm text-gray-600 mt-2 block"
					>Leave empty if your product is immediately available. Press
					<kbd
						class="px-2 py-1.5 text-xs font-semibold bg-gray-100 border border-gray-200 rounded-lg"
						>backspace</kbd
					> to remove the date.</span
				>
			</label>

			<label
				class="flex gap-2 items-center {enablePreorder
					? 'cursor-pointer'
					: 'cursor-not-allowed text-gray-450'}"
			>
				<input
					class="form-checkbox rounded-sm {enablePreorder
						? 'cursor-pointer'
						: 'cursor-not-allowed border-gray-450'}"
					type="checkbox"
					bind:checked={preorder}
					name="preorder"
					disabled={!enablePreorder}
				/>
				Enable preorders before available date
			</label>
		</div>
	{/if}

	{#if type !== 'donation'}
		<label class="flex gap-2 items-center cursor-pointer">
			<input
				class="form-checkbox rounded-sm cursor-pointer"
				type="checkbox"
				name="shipping"
				bind:checked={shipping}
			/>
			The product has a physical component that will be shipped to the customer's address
		</label>
	{/if}

	<label>
		Picture
		<input
			type="file"
			name="picture"
			accept="image/jpeg,image/png,image/webp"
			class="block"
			required
		/>
	</label>

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
