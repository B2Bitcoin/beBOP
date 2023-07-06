<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import Popup from './Popup.svelte';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import ProductAddedToCart from './ProductAddedToCart.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { UrlDependency } from '$lib/types/UrlDependency';

	let loading = false;
	export let picture: Picture | undefined;
	export let product: Pick<
		Product,
		| '_id'
		| 'name'
		| 'price'
		| 'shortDescription'
		| 'preorder'
		| 'availableDate'
		| 'shipping'
		| 'type'
	>;
	const widget = {};

	function addToCart() {
		$productAddedToCart = {
			product,
			quantity: 1,
			picture,
			widget
		};
	}
</script>

<div class="flex flex-row items-end justify-end">
	<form
		method="post"
		class="contents"
		use:enhance={() => {
			loading = true;
			return async ({ result }) => {
				loading = false;
				if (result.type === 'error') {
					return await applyAction(result);
				}

				await invalidate(UrlDependency.Cart);
				addToCart();
				// Not for the widget, see https://github.com/B2Bitcoin/B2BitcoinBootik/issues/243
				//document.body.scrollIntoView();
			};
		}}
	>
		<div class="relative">
			<button
				type="submit"
				value="Add to cart"
				disabled={loading}
				formaction="/product/{product._id}?/addToCart"
				class="btn btn-gray"
			>
				Add to cart
			</button>

			{#if $productAddedToCart && $productAddedToCart.widget === widget}
				<Popup>
					<ProductAddedToCart
						class="w-[562px] max-w-full"
						on:dismiss={() => ($productAddedToCart = null)}
						product={$productAddedToCart.product}
						picture={$productAddedToCart.picture}
					/>
				</Popup>
			{/if}
		</div>
	</form>
</div>
