<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import IconChevronDown from '$lib/components/icons/IconChevronDown.svelte';
	import IconChevronUp from '$lib/components/icons/IconChevronUp.svelte';
	import { MAX_PRODUCT_QUANTITY } from '$lib/types/Cart.js';

	export let data;

	$: items = data.cart || [];
</script>

<main class="mx-auto max-w-7xl p-6 flex flex-col gap-6">
	<Breadcrumbs
		links={[
			{ name: 'Home', url: '/' },
			{ name: 'Cart', url: '/cart' }
		]}
	/>
	<h1 class="font-bold text-5xl text-gray-850">Products</h1>
	{#each items as item}
		<form
			method="POST"
			use:enhance={({ action }) => {
				if (action.searchParams.has('/increase')) {
					item.quantity++;
				} else if (action.searchParams.has('/decrease')) {
					item.quantity--;
				} else if (action.searchParams.has('/delete')) {
					item.quantity = 0;
				}
			}}
			class="flex items-center gap-4 border-b border-gray-300 pb-6"
		>
			{#if item.picture}
				<div class="w-[138px] h-[138px] min-w-[138px] min-h-[138px] rounded flex items-center">
					<Picture picture={item.picture} class="rounded grow" sizes="138px" />
				</div>
			{/if}
			<div class="grow">
				<h2 class="text-2xl text-gray-850">{item.product.name}</h2>
				<p class="text-sm text-gray-600">{item.product.shortDescription}</p>
			</div>

			<div class="flex">
				<button
					formaction="/cart/{item.product._id}/?/increase"
					class="px-3 bg-gray-300 rounded-l text-gray-800 disabled:text-gray-450"
					disabled={item.quantity >= MAX_PRODUCT_QUANTITY}
				>
					<span class="sr-only">Increase quantity</span><IconChevronUp />
				</button>
				<input
					type="number"
					class="form-input text-center text-gray-850 text-xl rounded-none w-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					disabled
					name="quantity"
					value={item.quantity}
				/>
				<input type="hidden" name="quantity" value={item.quantity} />
				<button
					formaction="/cart/{item.product._id}/?/decrease"
					class="px-3 bg-gray-300 text-gray-800 disabled:text-gray-450 rounded-r"
				>
					<span class="sr-only">Decrease quantity</span><IconChevronDown />
				</button>
			</div>

			<div class="flex flex-col items-end">
				<PriceTag amount={item.product.price.amount} currency={item.product.price.currency} short />
				<PriceTag
					short
					currency={item.product.price.currency}
					amount={item.product.price.amount}
					convertedTo="EUR"
					exchangeRate={data.exchangeRate}
				/>
			</div>
		</form>
	{:else}
		<p>Cart is empty</p>
	{/each}
</main>
