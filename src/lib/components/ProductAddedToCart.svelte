<script lang="ts">
	import type { ProductFrontend } from '$lib/types/Product';
	import type { Picture as PictureType } from '$lib/types/Picture';
	import Picture from './Picture.svelte';
	import PriceTag from './PriceTag.svelte';
	import IconCross from './icons/IconCross.svelte';
	import { createEventDispatcher } from 'svelte';

	export let product: ProductFrontend;
	export let picture: PictureType;

	const dispatch = createEventDispatcher<{ dismiss: void }>();
</script>

<div
	class="rounded flex p-2 bg-gray-40 gap-4 relative"
	style="box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.13)"
>
	<Picture {picture} class="w-[138px] h-[138px] border-gray-300 border rounded object-cover" />
	<div class="flex flex-col grow gap-1">
		<h2 class="text-black text-[22px] font-medium">Product added to basket</h2>
		<h3 class="text-gray-850 text-base font-light">{product.name}</h3>
		<PriceTag
			currency={product.price.currency}
			class="text-xl text-gray-800"
			amount={product.price.amount}
		/>
		<div class="flex gap-2">
			<a href="/cart" class="grow basis-0 btn btn-gray"> View cart </a>
			<a href="/checkout" class="grow basis-0 btn btn-black"> Checkout </a>
		</div>
	</div>
	<IconCross class="absolute top-2 right-2 cursor-pointer" on:click={() => dispatch('dismiss')} />
</div>
