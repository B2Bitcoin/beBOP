<script lang="ts">
	import PictureComponent from '$lib/components/Picture.svelte';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays } from 'date-fns';
	import {
		DEFAULT_MAX_QUANTITY_PER_ORDER,
		MAX_NAME_LIMIT,
		MAX_SHORT_DESCRIPTION_LIMIT
	} from '$lib/types/Product';
	import { CURRENCIES, MININUM_PER_CURRENCY } from '$lib/types/Currency';
	import DeliveryFeesSelector from '$lib/components/DeliveryFeesSelector.svelte';
	import { page } from '$app/stores';
	import Editor from '@tinymce/tinymce-svelte';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage.js';
	import { TINYMCE_PLUGINS, TINYMCE_TOOLBAR } from '../../cms/tinymce-plugins.js';
	import { MultiSelect } from 'svelte-multiselect';

	export let data;

	let availableDate = data.product.availableDate;
	let availableDateStr = availableDate?.toJSON().slice(0, 10);
	let preorder = data.product.preorder;
	let displayPreorderCustomText = data.product.customPreorderText ? true : false;
	let shipping = data.product.shipping;
	let payWhatYouWant = data.product.payWhatYouWant;
	let priceAmountElement: HTMLInputElement;
	let standalone = data.product.standalone;
	let freeProduct = data.product.free;
	let hasStock = !!data.product.stock;
	let curr: 'SAT' | 'BTC';
	let disableDate = true;
	let eshopVisible = data.product.actionSettings.eShop.visible;
	let retailVisible = data.product.actionSettings.retail.visible;
	let googleShoppingVisible = data.product.actionSettings.googleShopping.visible;
	let eshopBasket = data.product.actionSettings.eShop.canBeAddedToBasket;
	let retailBasket = data.product.actionSettings.retail.canBeAddedToBasket;
	let contentBefore = data.product.contentBefore;
	let contentAfter = data.product.contentAfter;

	$: changedDate = availableDateStr !== availableDate?.toJSON().slice(0, 10);
	$: enablePreorder = availableDateStr && availableDateStr > new Date().toJSON().slice(0, 10);

	$: if (!enablePreorder) {
		preorder = false;
	}

	$: if (!availableDateStr) {
		availableDateStr = undefined;
		availableDate = undefined;
	}

	$: if (payWhatYouWant) {
		standalone = true;
	}

	function checkForm(event: SubmitEvent) {
		if (
			priceAmountElement.value &&
			+priceAmountElement.value <= MININUM_PER_CURRENCY[curr] &&
			!payWhatYouWant &&
			!freeProduct
		) {
			if (
				parseInt(priceAmountElement.value) === 0 &&
				!confirm('Do you want to save this product as free product? (current price == 0)')
			) {
				priceAmountElement.setCustomValidity(
					'Price must be greater than or equal to ' +
						MININUM_PER_CURRENCY[curr] +
						' ' +
						curr +
						' or might be free'
				);
				priceAmountElement.reportValidity();
				event.preventDefault();
				return;
			}
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

<!-- <h1 class="text-3xl">Edit a product</h1> -->

<ul
	class="flex flex-wrap text-xl font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400"
>
	<li class="mr-2">
		<a
			href="{data.adminPrefix}/product/{data.product._id}"
			class="{$page.url.pathname === `${data.adminPrefix}/product/${data.product._id}`
				? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
				: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
			>Edit a product</a
		>
	</li>
	{#if data.product.type === 'subscription'}
		<li class="mr-2">
			<a
				href="{data.adminPrefix}/product/{data.product._id}/subscribers"
				class="{$page.url.pathname === `${data.adminPrefix}/product/${data.product._id}/subscribers`
					? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
					: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
				>Subscribers</a
			>
		</li>
	{/if}
</ul>

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

		<div class="gap-4 flex flex-col md:flex-row">
			<label class="w-full">
				Price amount
				<input
					class="form-input"
					type="number"
					name="priceAmount"
					placeholder="Price"
					step="any"
					disabled={freeProduct}
					value={data.product.price.amount
						.toLocaleString('en', { maximumFractionDigits: 8 })
						.replace(/,/g, '')}
					bind:this={priceAmountElement}
					on:input={() => priceAmountElement?.setCustomValidity('')}
					required
				/>
			</label>

			<label class="w-full">
				Price currency

				<select
					name="priceCurrency"
					class="form-input"
					bind:value={curr}
					on:input={() => priceAmountElement?.setCustomValidity('')}
				>
					{#each CURRENCIES as currency}
						<option value={currency} selected={data.product.price.currency === currency}
							>{currency}</option
						>
					{/each}
				</select>
			</label>
		</div>
		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				bind:checked={payWhatYouWant}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				name="payWhatYouWant"
			/>
			This is a pay-what-you-want product
		</label>
		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				bind:checked={standalone}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				name="standalone"
				disabled={payWhatYouWant}
			/>
			This is a standalone product
		</label>
		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				bind:checked={freeProduct}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				name="free"
			/>
			This is a free product
		</label>
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

		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				name="displayShortDescription"
				bind:checked={data.product.displayShortDescription}
			/>
			Display the short description on product page
		</label>

		<label class="form-label">
			Description
			<textarea name="description" cols="30" rows="10" maxlength="10000" class="block form-input"
				>{data.product.description}</textarea
			>
		</label>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="form-label"
			>Product Tags
			<MultiSelect
				name="tagIds"
				options={data.tags.map((tag) => ({
					value: tag._id,
					label: tag.name
				}))}
				selected={data.product.tagIds?.map((tagId) => ({
					value: tagId,
					label: data.tags.find((tag) => tag._id === tagId)?.name ?? tagId
				})) ?? []}
			/>
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
						disabled={availableDate && availableDate.getTime() < Date.now() && disableDate}
						bind:value={availableDateStr}
						min={changedDate ? addDays(new Date(), 1).toJSON().slice(0, 10) : null}
					/>
					<span class="text-sm text-gray-600 mt-2 block"
						>Leave empty if your product is immediately available. Press
						<kbd
							class="px-2 py-1.5 text-xs font-semibold bg-gray-100 border border-gray-200 rounded-lg"
							>backspace</kbd
						> to remove the date.</span
					>
				</label>
				<label class="checkbox-label">
					<input class="form-checkbox" type="checkbox" bind:checked={disableDate} />
					🔐
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
			<label class="checkbox-label {enablePreorder ? '' : 'cursor-not-allowed text-gray-450'}">
				<input
					class="form-checkbox {enablePreorder ? '' : 'cursor-not-allowed border-gray-450'}"
					type="checkbox"
					bind:checked={displayPreorderCustomText}
					name="displayCustomPreorderText"
					disabled={!enablePreorder}
				/>
				Display custom text instead of date for preorder
			</label>
			<input type="hidden" name="changedDate" value={changedDate} />
		{/if}
		{#if displayPreorderCustomText}
			<label class="form-label">
				Preorder custom text
				<textarea
					name="customPreorderText"
					required
					cols="30"
					rows="2"
					maxlength="1000"
					value={data.product?.customPreorderText ?? ''}
					class="form-input"
				/>
			</label>
		{/if}
		{#if data.product.type !== 'subscription'}
			<label class="form-label">
				Max quantity per order

				<input
					class="form-input"
					type="number"
					name="maxQuantityPerOrder"
					placeholder="Max quantity per order"
					step="1"
					min="1"
					max="10"
					value={data.product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER}
				/>
			</label>
		{/if}

		{#if data.product.type === 'resource'}
			<h3 class="text-xl">Stock</h3>

			<label class="checkbox-label">
				<input class="form-checkbox" type="checkbox" name="hasStock" bind:checked={hasStock} />
				The product has a limited stock
			</label>

			{#if hasStock}
				<label class="form-label">
					Stock
					<input
						class="form-input"
						type="number"
						name="stock"
						placeholder="Stock"
						step="1"
						min="0"
						value={data.product.stock?.total ?? 0}
					/>
				</label>
			{/if}

			<ul class="list-disc ml-4">
				<li>Amount in pending orders / carts: <b>{data.reserved}</b></li>
				<li>Amount sold: <b>{data.sold}</b></li>
			</ul>
		{/if}

		{#if data.product.type !== 'donation'}
			<h3 class="text-xl">Delivery</h3>
			<label class="checkbox-label">
				<input class="form-checkbox" type="checkbox" name="shipping" bind:checked={shipping} />
				The product has a physical component that will be shipped to the customer's address
			</label>

			{#if shipping}
				{#if data.deliveryFees.mode === 'perItem'}
					<DeliveryFeesSelector
						deliveryFees={data.product.deliveryFees || {}}
						defaultCurrency={data.product.price.currency}
					/>

					<label class="checkbox-label">
						<input
							type="checkbox"
							name="requireSpecificDeliveryFee"
							bind:checked={data.product.requireSpecificDeliveryFee}
						/>
						Prevent order if no specific delivery fee matches the customer's country (do not use
						<a
							href="{data.adminPrefix}/config/delivery"
							class="text-link hover:underline"
							target="_blank"
						>
							globally defined fees
						</a> as fallback)
					</label>
				{/if}

				{#if data.deliveryFees.mode === 'perItem' || data.deliveryFees.applyFlatFeeToEachItem}
					<label class="checkbox-label">
						<input
							type="checkbox"
							name="applyDeliveryFeesOnlyOnce"
							bind:checked={data.product.applyDeliveryFeesOnlyOnce}
						/> Apply delivery fee only once, even if the customer orders multiple items
					</label>
				{/if}
			{/if}
		{/if}

		<h3 class="text-xl">Action settings</h3>
		<table class="w-full border border-gray-300 divide-y divide-gray-300">
			<thead class="bg-gray-200">
				<tr>
					<th class="py-2 px-4 border-r border-gray-300">Action</th>
					<th class="py-2 px-4 border-r border-gray-300">Eshop (anyone)</th>
					<th class="py-2 px-4 border-r border-gray-300">Retail (POS logged seat)</th>
					<th class="py-2 px-4">Google Shopping</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="py-2 px-4 border-r border-gray-300">Product is visible</td>
					<td class="py-2 px-4 border-r border-gray-300 text-center"
						><input
							type="checkbox"
							bind:checked={eshopVisible}
							name="eshopVisible"
							class="rounded"
						/></td
					>
					<td class="py-2 px-4 border-r border-gray-300 text-center"
						><input
							type="checkbox"
							bind:checked={retailVisible}
							name="retailVisible"
							class="rounded"
						/></td
					>
					<td class="py-2 px-4 border-r border-gray-300 text-center"
						><input
							type="checkbox"
							bind:checked={googleShoppingVisible}
							name="googleShoppingVisible"
							class="rounded"
						/></td
					>
				</tr>
				<tr>
					<td class="py-2 px-4 border border-gray-300">Product can be added to basket</td>
					<td class="py-2 px-4 border border-gray-300 text-center"
						><input
							type="checkbox"
							bind:checked={eshopBasket}
							name="eshopBasket"
							class="rounded"
						/></td
					>
					<td class="py-2 px-4 border border-gray-300 text-center"
						><input
							type="checkbox"
							bind:checked={retailBasket}
							name="retailBasket"
							class="rounded"
						/></td
					>
					<td class="py-2 px-4 border border-gray-300 text-center" />
				</tr>
			</tbody>
		</table>
		<label class="block w-full mt-4">
			Add CMS code and widgets before product page core
			<Editor
				scriptSrc="/tinymce/tinymce.js"
				bind:value={contentBefore}
				conf={{ plugins: TINYMCE_PLUGINS, toolbar: TINYMCE_TOOLBAR }}
			/>
			<p class="text-gray-700 my-3">
				To include tags, add a paragraph with only <code class="font-mono">[Tag=slug]</code>, where
				<code class="font-mono">slug</code> is the slug of your tag
			</p>
			<textarea
				name="contentBefore"
				cols="30"
				rows="10"
				maxlength={MAX_CONTENT_LIMIT}
				placeholder="HTML content"
				class="form-input block w-full"
				bind:value={contentBefore}
			/>
		</label>
		<label class="block w-full mt-4">
			Add CMS code and widgets after product page core
			<Editor
				scriptSrc="/tinymce/tinymce.js"
				bind:value={contentAfter}
				conf={{ plugins: TINYMCE_PLUGINS, toolbar: TINYMCE_TOOLBAR }}
			/>
			<p class="text-gray-700 my-3">
				To include tags, add a paragraph with only <code class="font-mono">[Tag=slug]</code>, where
				<code class="font-mono">slug</code> is the slug of your tag
			</p>
			<textarea
				name="contentAfter"
				cols="30"
				rows="10"
				maxlength={MAX_CONTENT_LIMIT}
				placeholder="HTML content"
				class="form-input block w-full"
				bind:value={contentAfter}
			/>
		</label>
		<div class="flex justify-between gap-2">
			<button
				type="submit"
				class="btn btn-blue"
				on:click={() => {
					priceAmountElement?.setCustomValidity('');
				}}>Update</button
			>
			<a href="/product/{data.product._id}" class="btn btn-gray">View</a>
			<a
				href="{data.adminPrefix}/product/new?duplicate_from={data.product._id}"
				class="btn btn-gray"
			>
				Duplicate
			</a>
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

<a href="{data.adminPrefix}/picture/new?productId={data.product._id}" class="underline"
	>Add picture</a
>

<div class="flex flex-row flex-wrap gap-6 mt-6">
	{#each data.pictures as picture}
		<div class="flex flex-col text-center">
			<a href="{data.adminPrefix}/picture/{picture._id}" class="flex flex-col items-center">
				<PictureComponent {picture} class="h-36 block" style="object-fit: scale-down;" />
				<span>{picture.name}</span>
			</a>
		</div>
	{/each}
</div>

{#if data.product.type !== 'donation'}
	<h2 class="text-2xl my-4">Digital Files</h2>

	<a href="{data.adminPrefix}/digital-file/new?productId={data.product._id}" class="underline"
		>Add digital file</a
	>

	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each data.digitalFiles as digitalFile}
			<a href="{data.adminPrefix}/digital-file/{digitalFile._id}" class="text-link hover:underline">
				{digitalFile.name}
			</a>
		{/each}
	</div>
{/if}
