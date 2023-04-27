<script lang="ts">
	import { enhance } from '$app/forms';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import IconChevronDown from '$lib/components/icons/IconChevronDown.svelte';
	import IconChevronUp from '$lib/components/icons/IconChevronUp.svelte';
	import { MAX_PRODUCT_QUANTITY } from '$lib/types/Cart';
	import { sum } from '$lib/utils/sum';

	export let data;

	$: items = data.cart || [];

	$: totalPrice = sum(items.map((item) => item.product.price.amount * item.quantity));
</script>

<main class="mx-auto max-w-7xl flex flex-col gap-2 px-6 py-10">
	<Breadcrumbs
		links={[
			{ name: 'Home', url: '/' },
			{ name: 'Cart', url: '/cart' }
		]}
	/>
	<div class="w-full rounded-xl p-6 flex flex-col gap-6 bg-white border-gray-300 border">
		<h1 class="font-bold text-5xl text-gray-850">Products</h1>

		{#if items.length}
			<div class="grid gap-x-4 gap-y-6" style="grid-template-columns: repeat(4, auto)">
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
						<div class="grow flex flex-col gap-2 self-stretch">
							<h2 class="text-2xl text-gray-850">{item.product.name}</h2>
							<p class="text-sm text-gray-600">{item.product.shortDescription}</p>
							<div class="grow" />

							<button
								formaction="/cart/{item.product._id}/?/remove"
								class="mt-auto mr-auto hover:underline text-blue text-base font-light"
							>
								Eliminate
							</button>
						</div>

						<div class="self-center">
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
						</div>

						<div class="flex flex-col items-end justify-center">
							<PriceTag
								amount={item.product.price.amount}
								currency={item.product.price.currency}
								class="text-2xl text-gray-800"
								short
							/>
							<PriceTag
								short
								class="text-base text-gray-600"
								currency={item.product.price.currency}
								amount={item.product.price.amount}
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
					<PriceTag amount={totalPrice} currency={'BTC'} class="text-[32px] text-gray-800" short />
					<PriceTag
						short
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
