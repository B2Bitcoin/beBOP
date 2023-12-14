<script lang="ts">
	import { CURRENCIES, MININUM_PER_CURRENCY } from '$lib/types/Currency';
	import {
		DEFAULT_MAX_QUANTITY_PER_ORDER,
		MAX_NAME_LIMIT,
		MAX_SHORT_DESCRIPTION_LIMIT,
		type Product
	} from '$lib/types/Product';
	import type { Tag } from '$lib/types/Tag';
	import { upperFirst } from '$lib/utils/upperFirst';
	import type { WithId } from 'mongodb';
	import { MultiSelect } from 'svelte-multiselect';
	import type { LayoutServerData } from '../../routes/(app)/$types';
	import DeliveryFeesSelector from './DeliveryFeesSelector.svelte';
	import Editor from '@tinymce/tinymce-svelte';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
	import {
		TINYMCE_PLUGINS,
		TINYMCE_TOOLBAR
	} from '../../routes/(app)/admin[[hash=admin_hash]]/cms/tinymce-plugins';
	import { generateId } from '$lib/utils/generateId';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ProductActionSettings } from '$lib/types/ProductActionSettings';
	import { uploadPicture } from '$lib/types/Picture';
	import { currencies } from '$lib/stores/currencies';

	export let tags: Pick<Tag, '_id' | 'name'>[];
	export let isNew = false;
	export let duplicateFromId: string | undefined = undefined;
	export let sold = 0;
	export let reserved = 0;
	export let globalDeliveryFees: LayoutServerData['deliveryFees'];
	export let adminPrefix: string;
	export let defaultActionSettings: ProductActionSettings;
	export let product: WithId<Product> = {
		_id: '',
		payWhatYouWant: false,
		standalone: false,
		type: 'resource',
		preorder: false,
		name: '',
		shipping: false,
		price: {
			amount: 0,
			currency: $currencies.priceReference
		},
		availableDate: undefined,
		displayShortDescription: false,
		free: false,
		stock: undefined,
		maxQuantityPerOrder: DEFAULT_MAX_QUANTITY_PER_ORDER,
		actionSettings: defaultActionSettings,
		createdAt: new Date(),
		updatedAt: new Date(),
		shortDescription: '',
		description: ''
	};

	let formElement: HTMLFormElement;
	let priceAmountElement: HTMLInputElement;
	let disableDateChange = !isNew;
	let displayPreorderCustomText = !!product.customPreorderText;
	let hasStock = !!product.stock;
	let allowDeposit = !!product.deposit;
	let submitting = false;
	let files: FileList;
	let deposit = product.deposit || {
		percentage: 50,
		enforce: false
	};

	if (product._id && isNew) {
		product.name = product.name + ' (duplicate)';
		product._id = generateId(product.name, false);
	}

	async function checkForm(event: SubmitEvent) {
		submitting = true;

		// Need to load here, or for some reason, some inputs disappear afterwards
		const formData = new FormData(formElement);
		try {
			if (
				priceAmountElement.value &&
				+priceAmountElement.value <= MININUM_PER_CURRENCY[product.price.currency] &&
				!product.payWhatYouWant &&
				!product.free
			) {
				if (
					parseInt(priceAmountElement.value) === 0 &&
					!confirm('Do you want to save this product as free product? (current price == 0)')
				) {
					priceAmountElement.setCustomValidity(
						'Price must be greater than or equal to ' +
							MININUM_PER_CURRENCY[product.price.currency] +
							' ' +
							product.price.currency +
							' or might be free'
					);
					priceAmountElement.reportValidity();
					event.preventDefault();
					return;
				}
			} else {
				priceAmountElement.setCustomValidity('');
			}

			if (!duplicateFromId && isNew) {
				const pictureId = await uploadPicture(adminPrefix, files[0]);

				formData.set('pictureId', pictureId);
			}

			const action = (event.submitter as HTMLButtonElement | null)?.formAction.includes('?/')
				? (event.submitter as HTMLButtonElement).formAction
				: formElement.action;

			const finalResponse = await fetch(action, {
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

	let availableDateStr = product.availableDate?.toJSON().slice(0, 10);

	$: changedDate = availableDateStr !== product.availableDate?.toJSON().slice(0, 10);
	$: enablePreorder = availableDateStr && availableDateStr > new Date().toJSON().slice(0, 10);

	$: if (!enablePreorder) {
		product.preorder = false;
	}

	$: if (!availableDateStr) {
		availableDateStr = undefined;
		product.availableDate = undefined;
	}

	$: if (product.type === 'subscription') {
		product.payWhatYouWant = false;
	}

	$: if (product.payWhatYouWant) {
		product.standalone = true;
	}

	$: if (product.free) {
		allowDeposit = false;
	}

	$: if (allowDeposit && !deposit) {
		deposit = {
			percentage: 50,
			enforce: false
		};
	}

	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this product?')) {
			event.preventDefault();
		}
	}
</script>

<form
	method="post"
	class="flex flex-col gap-4"
	action={isNew ? (duplicateFromId ? '?/duplicate' : '?/add') : `?/update`}
	bind:this={formElement}
	on:submit|preventDefault={checkForm}
	inert={submitting}
>
	<fieldset class="contents" disabled={submitting}>
		<label class="form-label">
			Product name
			<input
				class="form-input"
				type="text"
				maxlength={MAX_NAME_LIMIT}
				name="name"
				placeholder="Product name"
				bind:value={product.name}
				on:change={isNew ? () => (product._id = generateId(product.name, false)) : undefined}
				on:input={isNew ? () => (product._id = generateId(product.name, false)) : undefined}
				required
			/>
		</label>

		<label class="form-label" class:text-gray-450={!isNew}>
			Slug

			<input
				class="form-input"
				class:text-gray-450={!isNew}
				type="text"
				name="slug"
				placeholder="Slug"
				bind:value={product._id}
				title="Only lowercase letters, numbers and dashes are allowed"
				required
				disabled={!isNew}
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
					disabled={product.free}
					value={product.price.amount
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
					bind:value={product.price.currency}
					on:input={() => priceAmountElement?.setCustomValidity('')}
				>
					{#each CURRENCIES as currency}
						<option value={currency}>{currency}</option>
					{/each}
				</select>
			</label>
		</div>
		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				bind:checked={product.payWhatYouWant}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				name="payWhatYouWant"
				disabled={product.type === 'subscription'}
			/>
			This is a pay-what-you-want product
		</label>
		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				bind:checked={product.standalone}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				name="standalone"
				disabled={product.payWhatYouWant}
			/>
			This is a standalone product
		</label>
		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				bind:checked={product.free}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				name="free"
			/>
			This is a free product
		</label>
		<label class="checkbox-label">
			<input class="form-checkbox" type="checkbox" bind:checked={allowDeposit} />
			Allow partial deposit
		</label>
		{#if allowDeposit}
			<label class="form-label">
				Deposit percentage of total price
				<input
					class="form-input"
					type="number"
					name="depositPercentage"
					placeholder="Deposit"
					step="1"
					min="0"
					max="100"
					bind:value={deposit.percentage}
					required
				/>
			</label>

			<label class="checkbox-label">
				<input
					class="form-checkbox"
					type="checkbox"
					bind:checked={deposit.enforce}
					name="enforceDeposit"
				/>
				Enforce deposit - prevent customer from paying the full price immediately
			</label>
		{/if}
		<label class="form-label">
			Short description
			<textarea
				name="shortDescription"
				cols="30"
				rows="2"
				maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
				value={product.shortDescription}
				class="form-input"
			/>
		</label>

		<label class="checkbox-label">
			<input
				class="form-checkbox"
				type="checkbox"
				name="displayShortDescription"
				bind:checked={product.displayShortDescription}
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
				class="block form-input"
				value={product.description}
			/>
		</label>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="form-label"
			>Product Tags
			<MultiSelect
				name="tagIds"
				options={tags.map((tag) => ({
					value: tag._id,
					label: tag.name
				}))}
				selected={product.tagIds?.map((tagId) => ({
					value: tagId,
					label: tags.find((tag) => tag._id === tagId)?.name ?? tagId
				})) ?? []}
			/>
		</label>
		<label class:text-gray-450={!isNew} class="form-label">
			Type
			<select
				class="form-input"
				class:text-gray-450={!isNew}
				disabled={!isNew}
				value={product.type}
				name="type"
			>
				{#each ['resource', 'subscription', 'donation'] as type}
					<option value={type}>{upperFirst(type)}</option>
				{/each}
			</select>
		</label>

		{#if product.type === 'resource'}
			<div class="flex flex-wrap gap-4">
				<label>
					Available date

					<input
						class="form-input"
						type="date"
						name="availableDate"
						disabled={disableDateChange}
						bind:value={availableDateStr}
					/>
					<span class="text-sm text-gray-600 mt-2 block"
						>Leave empty if your product is immediately available. Press
						<kbd class="kbd">backspace</kbd> to remove the date.</span
					>
				</label>
				{#if !isNew}
					<label class="checkbox-label">
						<input class="form-checkbox" type="checkbox" bind:checked={disableDateChange} />
						🔐
					</label>
				{/if}
				<label class="checkbox-label {enablePreorder ? '' : 'cursor-not-allowed text-gray-450'}">
					<input
						class="form-checkbox {enablePreorder ? '' : 'cursor-not-allowed border-gray-450'}"
						type="checkbox"
						bind:checked={product.preorder}
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
					value={product?.customPreorderText ?? ''}
					class="form-input"
				/>
			</label>
		{/if}
		{#if product.type !== 'subscription'}
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
					value={product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER}
				/>
			</label>
		{/if}

		{#if product.type === 'resource'}
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
						value={product.stock?.total ?? 0}
					/>
				</label>
			{/if}

			{#if !isNew}
				<ul class="list-disc ml-4">
					<li>Amount in pending orders / carts: <b>{reserved}</b></li>
					<li>Amount sold: <b>{sold}</b></li>
				</ul>
			{/if}
		{/if}

		{#if product.type !== 'donation'}
			<h3 class="text-xl">Delivery</h3>
			<label class="checkbox-label">
				<input
					class="form-checkbox"
					type="checkbox"
					name="shipping"
					bind:checked={product.shipping}
				/>
				The product has a physical component that will be shipped to the customer's address
			</label>

			{#if product.shipping}
				{#if globalDeliveryFees.mode === 'perItem'}
					<DeliveryFeesSelector
						bind:deliveryFees={product.deliveryFees}
						defaultCurrency={product.price.currency}
					/>

					<label class="checkbox-label">
						<input
							type="checkbox"
							name="requireSpecificDeliveryFee"
							bind:checked={product.requireSpecificDeliveryFee}
						/>
						Prevent order if no specific delivery fee matches the customer's country (do not use
						<a
							href="{adminPrefix}/config/delivery"
							class="text-link hover:underline"
							target="_blank"
						>
							globally defined fees
						</a> as fallback)
					</label>
				{/if}

				{#if globalDeliveryFees.mode === 'perItem' || globalDeliveryFees.applyFlatFeeToEachItem}
					<label class="checkbox-label">
						<input
							type="checkbox"
							name="applyDeliveryFeesOnlyOnce"
							bind:checked={product.applyDeliveryFeesOnlyOnce}
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
							bind:checked={product.actionSettings.eShop.visible}
							name="eshopVisible"
							class="rounded"
						/></td
					>
					<td class="py-2 px-4 border-r border-gray-300 text-center"
						><input
							type="checkbox"
							bind:checked={product.actionSettings.retail.visible}
							name="retailVisible"
							class="rounded"
						/></td
					>
					<td class="py-2 px-4 border-r border-gray-300 text-center"
						><input
							type="checkbox"
							bind:checked={product.actionSettings.googleShopping.visible}
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
							bind:checked={product.actionSettings.eShop.canBeAddedToBasket}
							name="eshopBasket"
							class="rounded"
						/></td
					>
					<td class="py-2 px-4 border border-gray-300 text-center"
						><input
							type="checkbox"
							bind:checked={product.actionSettings.retail.canBeAddedToBasket}
							name="retailBasket"
							class="rounded"
						/></td
					>
					<td class="py-2 px-4 border border-gray-300 text-center" />
				</tr>
			</tbody>
		</table>
		<h3 class="text-xl">Add custom CTA</h3>
		{#each [...(product.cta || []), ...Array(3).fill( { href: '', label: '' } )].slice(0, 3) as link, i}
			<div class="flex gap-4">
				<label class="form-label">
					Text
					<input type="text" name="cta[{i}].label" class="form-input" value={link.label} />
				</label>
				<label class="form-label">
					Url
					<input type="text" name="cta[{i}].href" class="form-input" value={link.href} />
				</label>
			</div>
		{/each}

		{#if !isNew}
			<label class="block w-full mt-4">
				Add CMS code and widgets before product page core
				<Editor
					scriptSrc="/tinymce/tinymce.js"
					bind:value={product.contentBefore}
					conf={{ plugins: TINYMCE_PLUGINS, toolbar: TINYMCE_TOOLBAR }}
				/>
				<p class="text-gray-700 my-3">
					To include tags, add a paragraph with only <code class="font-mono">[Tag=slug]</code>,
					where
					<code class="font-mono">slug</code> is the slug of your tag
				</p>
				<textarea
					name="contentBefore"
					cols="30"
					rows="10"
					maxlength={MAX_CONTENT_LIMIT}
					placeholder="HTML content"
					class="form-input block w-full"
					bind:value={product.contentBefore}
				/>
			</label>
			<label class="block w-full mt-4">
				Add CMS code and widgets after product page core
				<Editor
					scriptSrc="/tinymce/tinymce.js"
					bind:value={product.contentAfter}
					conf={{ plugins: TINYMCE_PLUGINS, toolbar: TINYMCE_TOOLBAR }}
				/>
				<p class="text-gray-700 my-3">
					To include tags, add a paragraph with only <code class="font-mono">[Tag=slug]</code>,
					where
					<code class="font-mono">slug</code> is the slug of your tag
				</p>
				<textarea
					name="contentAfter"
					cols="30"
					rows="10"
					maxlength={MAX_CONTENT_LIMIT}
					placeholder="HTML content"
					class="form-input block w-full"
					bind:value={product.contentAfter}
				/>
			</label>
		{/if}

		{#if isNew}
			<input type="hidden" name="duplicateFromId" value={duplicateFromId || ''} />
			{#if !duplicateFromId}
				<label class="form-label">
					Picture
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						class="block"
						bind:files
						required
					/>
				</label>
			{/if}
		{/if}

		<div class="flex justify-between gap-2">
			<button
				type="submit"
				class="btn btn-blue"
				on:click={() => {
					priceAmountElement?.setCustomValidity('');
				}}>{isNew ? 'Create' : 'Update'}</button
			>
			{#if !isNew}
				<a href="/product/{product._id}" class="btn btn-gray">View</a>
				<a href="{adminPrefix}/product/new?duplicate_from={product._id}" class="btn btn-gray">
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
			{/if}
		</div>
	</fieldset>
</form>
