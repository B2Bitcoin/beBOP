<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import ProductType from '$lib/components/ProductType.svelte';
	import { sum } from '$lib/utils/sum';

	export let data;

	let actionCount = 0;

	$: items = data.cart || [];
	$: totalPrice = sum(items.map((item) => item.product.price.amount * item.quantity));
</script>

<main class="mx-auto max-w-7xl flex flex-col gap-2 px-6 py-10">
	<div class="w-full rounded-xl p-6 flex flex-col gap-6 bg-white border-gray-300 border">
		<h1 class="page-title">Products</h1>

		{#if items.length}
			<div
				class="grid gap-x-4 gap-y-6 overflow-hidden"
				style="grid-template-columns: auto 1fr auto auto"
			>
				{#each items as item}
					<form
						method="POST"
						class="contents"
						use:enhance={({ action }) => {
							if (action.searchParams.has('/increase')) {
								item.quantity++;
							} else if (action.searchParams.has('/decrease')) {
								item.quantity--;
							} else if (action.searchParams.has('/remove')) {
								item.quantity = 0;
							}
							actionCount++;
							let currentActionCount = actionCount;

							return async ({ result }) => {
								if (actionCount === currentActionCount) {
									if (result.type === 'redirect') {
										// Invalidate all to remove 0-quantity items
										await goto(result.location, { noScroll: true, invalidateAll: true });
										return;
									}
									await applyAction(result);
								}
							};
						}}
					>
						<div class="w-[138px] h-[138px] min-w-[138px] min-h-[138px] rounded flex items-center">
							{#if item.picture}
								<Picture
									picture={item.picture}
									class="rounded grow object-cover h-full w-full"
									sizes="138px"
								/>
							{/if}
						</div>
						<div class="flex flex-col gap-2">
							<h2 class="text-2xl text-gray-850">{item.product.name}</h2>
							<p class="text-sm text-gray-600">{item.product.shortDescription}</p>
							<div class="grow" />
							<div class="flex flex-row gap-2">
								<ProductType
									product={item.product}
									hasDigitalFiles={item.digitalFiles.length >= 1}
								/>
							</div>
							<button
								formaction="/cart/{item.product._id}/?/remove"
								class="mt-auto mr-auto hover:underline text-link text-base font-light"
							>
								Discard
							</button>
						</div>

						<div class="self-center">
							{#if item.product.type !== 'subscription'}
								<CartQuantity {item} />
							{/if}
						</div>

						<div class="flex flex-col items-end justify-center">
							<PriceTag
								amount={item.quantity * item.product.price.amount}
								currency={item.product.price.currency}
								class="text-2xl text-gray-800 truncate"
							/>
							<PriceTag
								class="text-base text-gray-600 truncate"
								amount={item.quantity * item.product.price.amount}
								currency={item.product.price.currency}
								convertedTo="EUR"
								exchangeRate={data.exchangeRate}
							/>
						</div>
					</form>

					<div class="border-b border-gray-300 col-span-4" />
				{/each}
			</div>
			<div class="flex justify-end border-b border-gray-300 pb-6 gap-6">
				<h2 class="text-gray-800 text-[32px]">Total:</h2>
				<div class="flex flex-col items-end">
					<PriceTag amount={totalPrice} currency={'BTC'} class="text-[32px] text-gray-800" />
					<PriceTag
						class="text-base text-gray-600"
						amount={totalPrice}
						currency={'BTC'}
						convertedTo="EUR"
						exchangeRate={data.exchangeRate}
					/>
				</div>
			</div>
			<a href="/checkout" class="btn btn-black w-80 ml-auto">Checkout</a>
		{:else}
			<p>Cart is empty</p>
		{/if}
	</div>
</main>
