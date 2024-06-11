<script lang="ts">
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import type { Picture } from '$lib/types/Picture';
	import type { Product } from '$lib/types/Product';
	import PictureComponent from '../Picture.svelte';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import PopupPos from '../PopupPOS.svelte';
	import IconCross from '../icons/IconCross.svelte';
	import { createEventDispatcher } from 'svelte';

	export let pictures: Picture[] | [];
	export let product: Pick<Product, 'name' | '_id' | 'price' | 'stock'>;
	let loading = false;
	let className = '';
	export { className as class };
	const widget = {};
	function addToCart() {
		$productAddedToCart = {
			product,
			quantity: 1,
			picture: pictures[0],
			widget
		};
	}
	let hasStock = true; //!!(product.stock?.available ?? Infinity)
	let errorMessage = '';
	const dispatch = createEventDispatcher<{ dismiss: void }>();
</script>

<form
	method="post"
	class="contents"
	action="/product/{product._id}?/addToCart"
	use:enhance={() => {
		loading = true;
		return async ({ result }) => {
			loading = false;
			if (result.type === 'error') {
				errorMessage = result.error.message;
				return;
			}

			await invalidate(UrlDependency.Cart);
			addToCart();
			// Not for the widget, see https://github.com/B2Bitcoin/B2BitcoinBootik/issues/243
			//document.body.scrollIntoView();
		};
	}}
>
	<button type="submit" class={!hasStock || loading ? 'disabled ' : ''}>
		<div class="touchScreen-product-cta flex flex-row {className} max-h-[4em]">
			<div>
				<PictureComponent picture={pictures[0]} class="object-contain h-24 w-48" />
			</div>
			<div class="p-4 flex items-start text-left">
				<h2 class="text-3xl">{product.name}</h2>
			</div>
		</div>
	</button>
</form>
{#if errorMessage}
	<PopupPos>
		<div class="{className} cartPreview flex flex-wrap p-2 gap-4 relative">
			<p>{errorMessage}</p>

			<button class="absolute top-2 right-2" type="button" on:click={() => dispatch('dismiss')}>
				<IconCross />
			</button>
		</div>
	</PopupPos>
{/if}

<style>
	button.disabled {
		pointer-events: none;
		opacity: 0.4;
	}
</style>
