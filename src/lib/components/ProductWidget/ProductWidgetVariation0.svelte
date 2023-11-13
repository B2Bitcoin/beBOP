<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';
	import PriceTag from '../PriceTag.svelte';
	import ProductType from '../ProductType.svelte';
	import AddToCart from '../AddToCart.svelte';

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
		| 'actionSettings'
	>;
	export let hasDigitalFiles: boolean;
	export let canAddToCart: boolean;

	let className = '';
	export { className as class };
</script>

<div class="relative mx-auto max-w-[800px] bg-gray-240 flex flex-col gap-4 p-6 rounded {className}">
	<div class="flex flex-row justify-end -mt-6 -mr-6">
		<ProductType {product} {hasDigitalFiles} class="last:rounded-tr first:rounded-bl pl-2" />
	</div>
	<div class="flex flex-col text-center">
		<a href="/product/{product._id}" class="flex flex-col items-center">
			<PictureComponent {picture} class="object-contain max-h-[174px] max-w-full" />
		</a>
	</div>

	<div class="flex flex-col">
		<div class="flex flex-row justify-between">
			<a href="/product/{product._id}" class="flex flex-col items-center">
				<h2 class="text-2xl">{product.name}</h2>
			</a>

			<div class="flex flex-row gap-2 items-end justify-center">
				<PriceTag
					amount={product.price.amount}
					currency={product.price.currency}
					class="text-2xl text-gray-800"
					main
				/>
				<PriceTag
					class="text-base text-gray-600"
					amount={product.price.amount}
					currency={product.price.currency}
					secondary
				/>
			</div>
		</div>
		<a href="/product/{product._id}" class="flex flex-col">
			<p class="mt-2 text-gray-800">
				{product.shortDescription}
			</p>
		</a>
		{#if canAddToCart}
			<AddToCart {product} {picture} />
		{/if}
	</div>
</div>
