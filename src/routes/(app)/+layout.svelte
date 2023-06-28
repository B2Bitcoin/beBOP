<script>
	import IconDownArrow from '$lib/components/icons/IconDownArrow.svelte';
	import IconSearch from '$lib/components/icons/IconSearch.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import IconBasket from '$lib/components/icons/IconBasket.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate, goto, invalidate } from '$app/navigation';
	import { navigating, page } from '$app/stores';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import ProductAddedToCart from '$lib/components/ProductAddedToCart.svelte';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import { sum } from '$lib/utils/sum';
	import Popup from '$lib/components/Popup.svelte';
	import { applyAction, enhance } from '$app/forms';
	import Picture from '$lib/components/Picture.svelte';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import IconTrash from '$lib/components/icons/IconTrash.svelte';
	import { DEFAULT_LOGO } from '$lib/types/Picture';

	export let data;

	let actionCount = 0;

	$: items = data.cart || [];
	$: totalPrice = sum(items.map((item) => item.product.price.amount * item.quantity));
	$: totalItems = sum(items.map((item) => item.quantity) ?? []);

	onMount(() => {
		// Update exchange rate every 5 minutes
		const interval = setInterval(() => invalidate(UrlDependency.ExchangeRate), 1000 * 60 * 5);

		return () => clearInterval(interval);
	});

	let cartOpen = false;

	$: if ($navigating) {
		$productAddedToCart = null;
	}

	afterNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) {
			cartOpen = false;
		}
	});
</script>

<svelte:head>
	<title>B2Bitcoin Bootik</title>
	<meta name="description" content="B2Bitcoin's official bootik" />
</svelte:head>

<div data-sveltekit-preload-data={data.isMaintenance ? 'tap' : 'hover'} style="display: contents;">
	<header class="bg-gray-850 items-center flex h-[100px]">
		<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 text-white grow">
			<a class="flex items-center gap-4" href="/">
				{#if data.logoPicture}
					<Picture class="h-[60px] w-[60px] rounded-full" picture={data.logoPicture} />
				{:else}
					<img class="h-[60px] w-[60px] rounded-full" src={DEFAULT_LOGO} alt="Main logo" />
				{/if}
				<span class="font-bold text-[32px]">{data.brandName}</span>
			</a>
			<span class="grow" />
			<nav class="flex gap-10 text-[22px] font-semibold">
				{#each data.links.topbar as link}
					<a href={link.href}>{link.label}</a>
				{/each}
			</nav>
			{#if 0}
				<div class="border-r-[1px] border-gray-700 h-8 border-solid" />
				<a href="/admin" class="btn btn-blue font-bold">Connect your wallet</a>
			{/if}
		</div>
	</header>
	<header class="bg-gray-240 text-gray-800 h-[66px] items-center flex">
		<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 grow">
			<nav class="flex gap-6 font-light items-center">
				{#if 0}
					<a href="/categories" class="flex gap-2 items-center">Categories <IconDownArrow /></a>
				{/if}
				{#each data.links.navbar as link}
					<a href={link.href}>{link.label}</a>
				{/each}
			</nav>
			{#if 0}
				<form action="/search" method="post" class="max-w-[520px] grow relative">
					<input type="text" name="search" class="form-input pr-8 border-gray-300" />
					<IconSearch class="absolute right-2 top-0 bottom-0 my-auto" />
				</form>
			{/if}
			<div class="flex items-center ml-auto gap-2">
				{#if 0}
					<IconWallet />
					<div class="flex flex-col">
						<PriceTag gap={'gap-1'} currency="BTC" amount={0.00_220_625} />
						<PriceTag
							gap={'gap-1'}
							currency="EUR"
							amount={1.22}
							class="ml-auto text-sm text-gray-550"
						/>
					</div>
					<div class="border-r-[1px] mx-1 border-gray-800 h-10 border-solid" />
				{/if}
				<div class="relative">
					<a
						href="/cart"
						on:click={(ev) => {
							if (!data.cart || $page.url.pathname === '/checkout') {
								return;
							}
							cartOpen = !cartOpen;
							ev.preventDefault();
						}}
						class="flex gap-2 items-center"
					>
						<IconBasket />
						{totalItems}
					</a>
					{#if $productAddedToCart && !$productAddedToCart.widget}
						<Popup>
							<ProductAddedToCart
								class="w-[562px] max-w-full"
								on:dismiss={() => ($productAddedToCart = null)}
								product={$productAddedToCart.product}
								picture={$productAddedToCart.picture}
							/>
						</Popup>
					{:else if cartOpen}
						<Popup>
							<div class="p-2 gap-2 flex flex-col">
								{#each items as item}
									<form
										class="flex border-b border-gray-300 pb-2 gap-2"
										method="POST"
										use:enhance={({ action }) => {
											if (action.searchParams.has('/increase')) {
												item.quantity++;
											} else if (action.searchParams.has('/decrease')) {
												item.quantity--;
											} else if (action.searchParams.has('/remove')) {
												item.quantity = 0;
											}
											actionCount++;
											let currentCount = actionCount;

											return async ({ result }) => {
												if (actionCount === currentCount) {
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
										<div
											class="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded flex items-center"
										>
											{#if item.picture}
												<Picture
													picture={item.picture}
													class="rounded grow object-cover h-full w-full"
													sizes="44px"
												/>
											{/if}
										</div>
										<div class="flex flex-col">
											<h3 class="text-base text-gray-850 font-medium">{item.product.name}</h3>
											{#if item.product.type !== 'subscription'}
												<div class="flex items-center gap-2 text-gray-700">
													<span class="text-xs">Quantity: </span>
													<CartQuantity {item} sm />
												</div>
											{/if}
										</div>
										<div class="flex flex-col items-end gap-[6px] ml-auto">
											<PriceTag
												class="text-gray-600 text-base"
												amount={item.quantity * item.product.price.amount}
												currency={item.product.price.currency}
											/>
											<button formaction="/cart/{item.product._id}/?/remove">
												<IconTrash class="text-gray-800" />
												<span class="sr-only">Remote item from cart</span>
											</button>
										</div>
									</form>
								{/each}
								<div class="flex gap-1 text-xl text-gray-850 justify-end items-center">
									Total <PriceTag currency="BTC" amount={totalPrice} />
								</div>
								<a href="/cart" class="btn btn-gray mt-1 whitespace-nowrap"> View cart </a>
								{#if items.length > 0}<a href="/checkout" class="btn btn-black"> Checkout </a>{/if}
							</div>
						</Popup>
					{/if}
				</div>
			</div>
		</div>
	</header>
	<div class="grow bg-gray-75">
		<slot />
	</div>
	<footer class="bg-gray-850 h-[90px] items-center flex">
		<div class="mx-auto max-w-7xl px-6 flex items-center gap-2 text-gray-550 grow">
			<span class="font-light">Powered by</span><span class="font-display text-xl text-white">
				LaBookinerie.
			</span>
			<div class="ml-auto flex gap-4 items-center">
				{#each data.links.footer as link}
					<a href={link.href} class="text-gray-550">{link.label}</a>
				{/each}
			</div>
		</div>
	</footer>
</div>
