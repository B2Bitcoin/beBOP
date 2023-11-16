<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';
	import PriceTag from '../PriceTag.svelte';
	import ProductType from '../ProductType.svelte';
	import AddToCart from '../AddToCart.svelte';

	export let pictures: Picture[] | [];
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

<div class="relative mx-auto max-w-max bg-gray-240 flex flex-wrap gap-4 p-6 rounded {className}">
	<div class="flex flex-col">
		<div class="flex flex-row justify-start -mt-6 -ml-6">
			<ProductType
				{product}
				{hasDigitalFiles}
				class="last:rounded-tr first:rounded-bl pl-2 text-sm"
			/>
		</div>
		<a href="/product/{product._id}" class="-ml-6">
			<PictureComponent picture={pictures[0]} class="object-contain max-h-[264px] max-w-[264px]" />
		</a>
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-2">
			<a href="/product/{product._id}" class="flex flex-col">
				<h2 class="text-2xl">{product.name}</h2>
			</a>

			<div class="flex flex-row gap-2">
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
			<p class="mt-2 text-gray-800 max-w-[500px]">
				{product.shortDescription}
			</p>
		</a>
		{#if canAddToCart}
			<div class="flex flex-row items-end justify-end">
				<AddToCart {product} picture={pictures[0]} class="btn btn-gray" />
			</div>
		{/if}
	</div>
</div>
