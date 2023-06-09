<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from './Picture.svelte';
	import PriceTag from './PriceTag.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';

	export let picture: Picture | undefined;
	export let product: Pick<
		Product,
		'_id' | 'name' | 'price' | 'shortDescription' | 'preorder' | 'availableDate'
	>;
	export let exchangeRate = 0;
	let loading = false;
	let isButtonDisabled = false;

	function addToCart() {
		$productAddedToCart = {
			product,
			quantity: 1,
			picture
		};
	}

	function disableAddToCart() {
		if (product.availableDate != null) {
			isButtonDisabled =
				product.availableDate.getTime() > Date.now() && product.preorder == false ? true : false;
		}

		return isButtonDisabled;
	}
</script>

<div class="flex flex-col text-center not-prose">
	<a href="/product/{product._id}" class="flex flex-col items-center">
		<PictureComponent {picture} class="object-contain max-h-[250px] max-w-full" />
	</a>
</div>

<div class="flex flex-col m-6 not-prose">
	<div class="flex flex-row gap-2">
		<a href="/product/{product._id}" class="flex flex-col items-center">
			<h2 class="text-4xl">{product.name}</h2>
		</a>

		<div class="grow" />

		<div class="flex flex-row items-end justify-center">
			<PriceTag
				amount={product.price.amount}
				currency={product.price.currency}
				class="text-3xl text-gray-800"
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
	<a href="/product/{product._id}" class="flex flex-col items-center">
		<p class="text-2xl mt-4 text-gray-800">
			{product.shortDescription}
		</p>
	</a>
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
					document.body.scrollIntoView();
				};
			}}
		>
			<button
				type="submit"
				value="Add to cart"
				disabled={loading || disableAddToCart()}
				formaction="/product/{product._id}?/addToCart"
				class="btn btn-gray"
			>
				Add to cart
			</button>
		</form>
	</div>
</div>
