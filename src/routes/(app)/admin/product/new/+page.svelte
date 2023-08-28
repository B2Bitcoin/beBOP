<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import DeliveryFeesSelector from '$lib/components/DeliveryFeesSelector.svelte';
	import { CURRENCIES, MININUM_PER_CURRENCY, SATOSHIS_PER_BTC } from '$lib/types/Currency';
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
	import { generateId } from '$lib/utils/generateId.js';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays } from 'date-fns';
	import PictureComponent from '$lib/components/Picture.svelte';

	export let data;
	let product = data.product;

	let submitting = false;

	let priceAmountElement: HTMLInputElement;
	let formElement: HTMLFormElement;
	let files: FileList;
	let payWhatYouWant = false;
	let standalone = payWhatYouWant;
	let typeElement: HTMLSelectElement;

	let preorder = product?.preorder ?? false;
	let name = product?.name ? product.name + ' (duplicate)' : '';
	let slug = generateId(name, false);
	let shipping = product?.shipping ?? false;
	let type = product?.type ?? 'resource';
	let priceAmount = product?.price.amount ?? 0;
	let priceCurrency = product?.price.currency ?? data.priceReferenceCurrency;
	let availableDate: string | undefined = product?.availableDate?.toJSON()?.slice(0, 10) ?? '';
	let displayShortDescription = product?.displayShortDescription ?? false;

	let curr: 'SAT' | 'BTC';
	$: enablePreorder = availableDate && availableDate > new Date().toJSON().slice(0, 10);

	$: if (!enablePreorder) {
		preorder = false;
	}

	$: if (!availableDate || type !== 'resource') {
		availableDate = undefined;
	}

	async function checkForm(event: SubmitEvent) {
		submitting = true;

		// Need to load here, or for some reason, some inputs disappear afterwards
		const formData = new FormData(formElement);

		try {
			if (
				priceAmountElement.value &&
				+priceAmountElement.value <= MININUM_PER_CURRENCY[curr] &&
				!payWhatYouWant
			) {
				priceAmountElement.setCustomValidity(
					'Price must be greater than ' + MININUM_PER_CURRENCY[curr] + ' ' + curr
				);
				priceAmountElement.reportValidity();
				event.preventDefault();
				return;
			} else if (payWhatYouWant && typeElement.value === 'subscription') {
				typeElement.setCustomValidity(
					'You cannot create a subscription type product with a pay-what-you-want price '
				);
				typeElement.reportValidity();
				event.preventDefault();
				return;
			} else {
				priceAmountElement.setCustomValidity('');
				typeElement.setCustomValidity('');
			}

			if (!product) {
				const fileSize = files[0].size;
				const fileName = files[0].name;

				const response = await fetch('/admin/picture/prepare', {
					method: 'POST',
					body: JSON.stringify({
						fileName,
						fileSize
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!response.ok) {
					throw new Error(await response.text());
				}

				const body = await response.json();

				const { uploadUrl, pictureId } = body;

				const uploadResponse = await fetch(uploadUrl, {
					method: 'PUT',
					body: files[0]
				});

				if (!uploadResponse.ok) {
					throw new Error(await uploadResponse.text());
				}

				formData.set('pictureId', pictureId);
			}

			const finalResponse = await fetch(formElement.action, {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await finalResponse.text());

			if (result.type === 'success') {
				// rerun all `load` functions, following the successful update
				await invalidateAll();
			}

			applyAction(result);
		} finally {
			submitting = false;
		}
	}
</script>

<h1 class="text-3xl">Add a product</h1>

<form
	action={product ? '?/duplicate' : '?/add'}
	method="post"
	class="flex flex-col gap-4"
	bind:this={formElement}
	on:submit|preventDefault={checkForm}
>
	<label class="form-label">
		Product name
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="name"
			placeholder="Product name"
			bind:value={name}
			on:change={() => (slug = generateId(name, false))}
			on:input={() => (slug = generateId(name, false))}
			required
		/>
	</label>

	<label class="form-label">
		Slug

		<input
			class="form-input block"
			type="text"
			name="slug"
			placeholder="Slug"
			bind:value={slug}
			title="Only lowercase letters, numbers and dashes are allowed"
			required
		/>
	</label>

	<div class="gap-4 flex flex-col md:flex-row">
		<label class="w-full form-label">
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

		<label class="w-full form-label">
			Price currency

			<select
				name="priceCurrency"
				class="form-input"
				bind:value={curr}
				on:input={() => priceAmountElement?.setCustomValidity('')}
			>
				{#each CURRENCIES as currency}
					<option value={currency} selected={priceCurrency === currency}>
						{currency}
					</option>
				{/each}
			</select>
		</label>
	</div>
	<label class="checkbox-label">
		<input
			class="form-checkbox"
			type="checkbox"
			bind:checked={payWhatYouWant}
			on:input={() => {
				priceAmountElement?.setCustomValidity(''), typeElement.setCustomValidity('');
			}}
			name="payWhatYouWant"
		/>
		This is a pay-what-you-want product
	</label>
	<label class="checkbox-label">
		<input class="form-checkbox" type="checkbox" bind:checked={standalone} name="standalone" />
		This is a standalone product
	</label>

	<label class="form-label">
		Short description
		<textarea
			name="shortDescription"
			cols="30"
			rows="2"
			maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
			value={product?.shortDescription ?? ''}
			class="form-input"
		/>
	</label>

	<label class="checkbox-label">
		<input
			class="form-checkbox"
			type="checkbox"
			name="displayShortDescription"
			bind:checked={displayShortDescription}
		/>
		Display the short description on product page
	</label>

	<label class="form-label">
		Description
		<textarea
			name="description"
			cols="30"
			rows="10"
			maxlength="10000"
			value={product?.description ?? ''}
			class="form-input"
		/>
	</label>

	<label>
		Type
		<select
			class="form-input"
			bind:value={type}
			name="type"
			bind:this={typeElement}
			on:input={() => typeElement?.setCustomValidity('')}
		>
			{#each ['resource', 'donation', 'subscription'] as type}
				<option value={type}>{upperFirst(type)}</option>
			{/each}
		</select>
	</label>

	{#if type === 'resource'}
		<div class="flex flex-wrap gap-4">
			<label class="form-label">
				Available date

				<input
					class="form-input"
					type="date"
					name="availableDate"
					bind:value={availableDate}
					min={addDays(new Date(), 1).toJSON().slice(0, 10)}
				/>
				<span class="text-sm text-gray-600 mt-2 block">
					Leave empty if your product is immediately available. Press
					<kbd
						class="px-2 py-1.5 text-xs font-semibold bg-gray-100 border border-gray-200 rounded-lg"
						>backspace</kbd
					> to remove the date.
				</span>
			</label>

			<label class="checkbox-label {enablePreorder ? '' : 'cursor-not-allowed text-gray-450'}">
				<input
					class="form-checkbox {enablePreorder ? '' : 'cursor-not-allowed border-gray-450'}"
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
		<h3 class="text-xl">Delivery</h3>

		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				name="shipping"
				bind:checked={shipping}
				disabled={submitting}
			/>
			The product has a physical component that will be shipped to the customer's address
		</label>

		{#if shipping}
			{#if data.deliveryFees.mode === 'perItem'}
				<DeliveryFeesSelector
					defaultCurrency={product?.price.currency ?? data.priceReferenceCurrency}
					deliveryFees={product?.deliveryFees ?? {}}
					disabled={submitting}
				/>

				<label class="checkbox-label">
					<input
						type="checkbox"
						name="requireSpecificDeliveryFee"
						checked={product?.requireSpecificDeliveryFee ?? false}
						disabled={submitting}
					/>
					Prevent order if no specific delivery fee matches the customer's country (do not use
					<a href="/admin/config/delivery" class="text-link hover:underline" target="_blank">
						globally defined fees
					</a> as fallback)
				</label>
			{/if}

			{#if data.deliveryFees.mode === 'perItem' || data.deliveryFees.applyFlatFeeToEachItem}
				<label class="checkbox-label">
					<input
						type="checkbox"
						name="applyDeliveryFeesOnlyOnce"
						checked={product?.applyDeliveryFeesOnlyOnce ?? false}
						disabled={submitting}
					/> Apply delivery fee only once, even if the customer orders multiple items
				</label>
			{/if}
		{/if}
	{/if}

	<input type="hidden" name="productId" value={data.productId || ''} />
	{#if !product}
		<label class="form-label">
			Picture
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				class="block"
				bind:files
				required
				disabled={submitting}
			/>
		</label>
	{/if}

	<input
		type="submit"
		class="btn btn-blue self-start text-white"
		disabled={submitting}
		value="Submit"
	/>
</form>
{#if data.pictures?.length}
	<h2 class="text-2xl my-4">Photos</h2>

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
{/if}

{#if data.digitalFiles?.length}
	<h2 class="text-2xl my-4">Digital Files</h2>

	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each data.digitalFiles as digitalFile}
			<a href="/admin/digital-file/{digitalFile._id}" class="text-link hover:underline">
				{digitalFile.name}
			</a>
		{/each}
	</div>
{/if}
