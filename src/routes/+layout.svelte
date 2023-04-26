<script>
	import '../app.css';
	import '@fontsource/outfit/700.css';
	import '@fontsource/outfit/600.css';
	import '@fontsource/outfit/500.css';
	import '@fontsource/outfit/400.css';
	import '@fontsource/outfit/300.css';
	import IconDownArrow from '$lib/components/icons/IconDownArrow.svelte';
	import IconSearch from '$lib/components/icons/IconSearch.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import IconBasket from '$lib/components/icons/IconBasket.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import ProductAddedToCart from '$lib/components/ProductAddedToCart.svelte';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import { sum } from '$lib/utils/sum';

	export let data;

	$: cartItems = sum(data.cart?.map((item) => item.quantity) ?? []);

	onMount(() => {
		// Update exchange rate every 5 minutes
		const interval = setInterval(() => invalidate(UrlDependency.ExchangeRate), 1000 * 60 * 5);

		return () => clearInterval(interval);
	});

	$: if ($navigating) {
		$productAddedToCart = null;
	}
</script>

<svelte:head>
	<title>B2Bitcoin Bootik</title>
	<meta name="description" content="B2Bitcoin's official bootik" />
</svelte:head>

<header class="bg-gray-850 items-center flex h-[100px]">
	<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 text-white grow">
		<a class="flex items-center gap-4" href="/">
			<img
				class="h-[60px] w-[60px] rounded-full"
				src="https://coyo.dev/icons/logo.png"
				alt="Main logo"
			/>
			<span class="font-bold text-[32px]">Samdoesart</span>
		</a>
		<span class="grow" />
		<nav class="flex gap-10 text-[22px] font-semibold">
			<a href="/">Blog</a>
			<a href="/store">Store</a>
			<a href="/mecenas">Mecenas</a>
		</nav>
		<div class="border-r-[1px] border-gray-700 h-8 border-solid" />
		<a href="/connect" class="btn btn-blue font-bold">Connect your wallet</a>
	</div>
</header>
<header class="bg-gray-240 text-gray-800 h-[66px] items-center flex">
	<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 grow">
		<nav class="flex gap-6 font-light items-center">
			<a href="/categories" class="flex gap-2 items-center">Categories <IconDownArrow /></a>
			<a href="/challenges">Challenges</a>
			<a href="/rewards">Rewards</a>
		</nav>
		<form action="/search" method="post" class="max-w-[520px] grow relative">
			<input type="text" name="search" class="form-input pr-8 border-gray-300" />
			<IconSearch class="absolute right-2 top-0 bottom-0 my-auto" />
		</form>
		<div class="flex items-center ml-auto gap-2">
			<IconWallet />
			<div class="flex flex-col">
				<PriceTag gap={'gap-1'} currency="BTC" amount={0.00_220_625} short />
				<PriceTag
					gap={'gap-1'}
					currency="EUR"
					amount={1.22}
					class="ml-auto text-sm text-gray-550"
					short
				/>
			</div>
			<div class="border-r-[1px] mx-1 border-gray-800 h-10 border-solid" />
			<div class="relative">
				<a href="/cart" class="flex gap-2 items-center">
					<IconBasket />
					{cartItems}
				</a>
				{#if $productAddedToCart}
					<div
						class="absolute z-20 ml-1 w-0 h-0 -bottom-1 translate-y-full border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-gray-40"
					/>
					<div class="absolute z-10 -bottom-4 right-0 w-[562px] max-w-[95vw] translate-y-full">
						<ProductAddedToCart
							on:dismiss={() => ($productAddedToCart = null)}
							product={$productAddedToCart.product}
							picture={$productAddedToCart.picture}
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
<div class="grow">
	<slot />
</div>
<footer class="bg-gray-850 h-[90px] items-center flex">
	<div class="mx-auto max-w-7xl px-6 flex items-center gap-2 text-gray-550 grow">
		<span class="font-light">Power by</span><span class="font-display text-xl text-white">
			LaBookinerie.
		</span>
	</div>
</footer>
