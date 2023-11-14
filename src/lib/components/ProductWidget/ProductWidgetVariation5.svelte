<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';
	import { useI18n } from '$lib/i18n';
	import Popup from '../Popup.svelte';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import ProductAddedToCart from '../ProductAddedToCart.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { UrlDependency } from '$lib/types/UrlDependency';

	let className = '';
	export { className as class };

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
		| 'actionSettings'
	>;
	export let pictures: Picture[] | [];
	export let canAddToCart: boolean;

	const widget = {};
	function addToCart() {
		$productAddedToCart = {
			product,
			quantity: 1,
			picture: pictures[0],
			widget
		};
	}
	let loading = false;

	const { t } = useI18n();
	let pictureId = 0;
</script>

<div class="flex flex-col mx-auto rounded p-4 sm:flex-row sm:gap-2 {className}">
	<div class="flex flex-wrap bg-gray-100 w-full sm:w-5/6 mb-4 sm:mb-0">
		<div class="p-4 w-full sm:w-2/3">
			<a href="/product/{product._id}">
				<h2 class="text-2xl font-bold mb-2">{product.name}</h2>
			</a>
			<a href="/product/{product._id}">
				<p class="text-gray-600 mb-4">{product.shortDescription}</p>
			</a>
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
				<div class="flex flex-wrap gap-6 items-end">
					{#if canAddToCart}
						<div class="relative">
							<button
								type="submit"
								disabled={loading}
								formaction="/product/{product._id}?/addToCart"
								class="bg-blue-500 text-white text-xl text-center w-full md:w-[150px] p-1"
							>
								{t('product.cta.buy')}
							</button>

							{#if $productAddedToCart && $productAddedToCart.widget === widget}
								<Popup>
									<ProductAddedToCart
										class="w-[562px] max-w-full"
										on:dismiss={() => ($productAddedToCart = null)}
										product={$productAddedToCart.product}
										picture={$productAddedToCart.picture}
										customPrice={$productAddedToCart.customPrice}
									/>
								</Popup>
							{/if}
						</div>
					{/if}
					<a href="/product/{product._id}">
						<div class="bg-blue-500 text-white text-xl text-center w-full md:w-[150px] p-1">
							{t('product.cta.details')}
						</div>
					</a>
				</div>
			</form>
		</div>

		<div class="justify-end w-full sm:w-1/3 sm:mt-0">
			<a href="/product/{product._id}">
				<PictureComponent
					picture={pictures[pictureId]}
					class="h-[280px] mt-5 ml-auto object-contain"
				/>
			</a>
		</div>
	</div>

	<div class="ml-0 sm:ml-4 w-full sm:w-1/6 flex-col hidden sm:inline">
		{#if pictures.length > 1}
			{#each pictures as picture, i}
				<a href="#picture{i}" on:click={() => (pictureId = i)}>
					<PictureComponent
						{picture}
						class="w-[100px] h-[100px] border-gray-300 border rounded object-cover mb-2 {pictureId ===
						i
							? 'ring-2 ring-link ring-offset-2'
							: ''} "
					/>
				</a>
			{/each}
		{/if}
	</div>
</div>
