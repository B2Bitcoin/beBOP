<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from './Picture.svelte';
	import PriceTag from './PriceTag.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import ProductType from './ProductType.svelte';
	import Popup from './Popup.svelte';
	import ProductAddedToCart from './ProductAddedToCart.svelte';

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
	export let exchangeRate = 0;
	let className = '';
	export { className as class };

	let loading = false;

	const widget = {};

	function addToCart() {
		$productAddedToCart = {
			product,
			quantity: 1,
			picture,
			widget
		};
	}

	$: canAddToCart =
		!product.availableDate || product.availableDate <= new Date() || !!product.preorder;
</script>

<div class="relative mx-auto max-w-[800px] bg-gray-240 flex flex-col gap-4 p-6 rounded {className}">
	<div class="flex flex-row justify-end -mt-6 -mr-6">
		<ProductType {product} class="last:rounded-tr first:rounded-bl pl-2" />
	</div>
	<div class="flex flex-col text-center">
		<a href="/product/{product._id}" class="flex flex-col items-center">
			<PictureComponent {picture} sizes="800px" class="object-contain max-h-[250px] max-w-full" />
		</a>
	</div>

	<div class="flex flex-col">
		<div class="flex flex-row">
			<a href="/product/{product._id}" class="flex flex-col items-center">
				<h2 class="text-2xl">{product.name}</h2>
			</a>

			<div class="grow" />

			<div class="flex flex-row items-end justify-center">
				<PriceTag
					amount={product.price.amount}
					currency={product.price.currency}
					class="text-2xl text-gray-800"
				/>
				&nbsp; ~ &nbsp;
				<PriceTag
					class="text-base text-gray-600"
					amount={product.price.amount}
					currency={product.price.currency}
					{exchangeRate}
					convertedTo="EUR"
				/>
			</div>
		</div>
		<a href="/product/{product._id}" class="flex flex-col">
			<p class="mt-2 text-gray-800">
				{product.shortDescription}
			</p>
		</a>
		{#if canAddToCart}
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
		{/if}
	</div>
</div>
