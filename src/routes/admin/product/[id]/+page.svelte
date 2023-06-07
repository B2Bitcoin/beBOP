<script lang="ts">
	import PictureComponent from '$lib/components/Picture.svelte';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays } from 'date-fns';
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';

	export let data;

	let availableDate = data.product.availableDate;
	let availableDateStr = availableDate?.toJSON().slice(0, 10);
	let preorder = data.product.preorder;

	let priceAmountElement: HTMLInputElement;

	$: changedDate = availableDateStr !== availableDate?.toJSON().slice(0, 10);
	$: enablePreorder = availableDateStr && availableDateStr > new Date().toJSON().slice(0, 10);

	$: if (!enablePreorder) {
		preorder = false;
	}

	$: if (!availableDateStr) {
		availableDateStr = undefined;
		availableDate = undefined;
	}

	function checkForm(event: SubmitEvent) {
		if (priceAmountElement.value && +priceAmountElement.value < 0.00000001) {
			priceAmountElement.setCustomValidity('Price must be greater than 1 SAT');
			priceAmountElement.reportValidity();
			event.preventDefault();
			return;
		} else {
			priceAmountElement.setCustomValidity('');
		}
	}
	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this product?')) {
			event.preventDefault();
		}
	}
</script>

<h1 class="text-3xl">Edit a product</h1>

<div class="flex flex-col">
	<form method="post" class="flex flex-col gap-4" action="?/update" on:submit={checkForm}>
		<label>
			Name
			<input
				type="text"
				name="name"
				maxlength={MAX_NAME_LIMIT}
				class="form-input block"
				value={data.product.name}
			/>
		</label>
		<label>
			Price (BTC)
			<input
				type="number"
				name="priceAmount"
				class="form-input block"
				step="any"
				value={data.product.price.amount.toLocaleString('en', { maximumFractionDigits: 8 })}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				bind:this={priceAmountElement}
			/>
		</label>

		<input type="hidden" name="priceCurrency" value={data.product.price.currency} />

		<label>
			Short description
			<textarea
				name="shortDescription"
				cols="30"
				rows="2"
				maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
				class="block form-input">{data.product.shortDescription}</textarea
			>
		</label>

		<label>
			Description
			<textarea name="description" cols="30" rows="10" maxlength="10000" class="block form-input"
				>{data.product.description}</textarea
			>
		</label>

		<label class="text-gray-450">
			Type
			<select class="form-input text-gray-450" disabled value={data.product.type}>
				<option value={data.product.type}>{upperFirst(data.product.type)}</option>
			</select>
		</label>

		{#if data.product.type === 'resource'}
			<div class="flex flex-wrap gap-4">
				<label>
					Available date

					<input
						class="form-input"
						type="date"
						name="availableDate"
						bind:value={availableDateStr}
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

			<input type="hidden" name="changedDate" value={changedDate} />
		{/if}

		{#if data.product.type !== 'donation'}
			<label class="flex gap-2 items-center cursor-pointer">
				<input
					class="form-checkbox rounded-sm cursor-pointer"
					type="checkbox"
					name="shipping"
					checked={data.product.shipping}
				/>
				The product has a physical component that will be shipped to the customer's address
			</label>
		{/if}

		<div class="flex justify-between gap-2">
			<button type="submit" class="btn btn-blue">Update</button>
			<a href="/product/{data.product._id}" class="btn btn-gray">View</a>
			<button
				type="submit"
				class="ml-auto btn btn-red"
				formaction="?/delete"
				on:click={confirmDelete}
			>
				Delete
			</button>
		</div>
	</form>
</div>

<h2 class="text-2xl my-4">Photos</h2>

<a href="/admin/picture/new?productId={data.product._id}" class="underline">Add picture</a>

<div class="flex flex-row flex-wrap gap-6 mt-6">
	{#each data.pictures as picture}
		<div class="flex flex-col text-center">
			<a href="/admin/picture/{picture._id}" class="flex flex-col items-center">
				<PictureComponent {picture} class="h-36 block" style="object-fit: scale-down;" />
				<span>{picture.name}</span>
			</a>
		</div>
	{/each}
</div>

{#if data.product.type !== 'donation'}
	<h2 class="text-2xl my-4">Digital Files</h2>

	<a href="/admin/digital-file/new?productId={data.product._id}" class="underline"
		>Add digital file</a
	>

	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each data.digitalFiles as digitalFile}
			<a href="/admin/digital-file/{digitalFile._id}" class="text-blue hover:underline">
				{digitalFile.name}
			</a>
		{/each}
	</div>
{/if}
