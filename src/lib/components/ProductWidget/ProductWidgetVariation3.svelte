<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';
	import PriceTag from '../PriceTag.svelte';
	import ProductType from '../ProductType.svelte';
	import AddToCart from '../AddToCart.svelte';
	import { useI18n } from '$lib/i18n';

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
		| 'stock'
	>;
	export let hasDigitalFiles: boolean;
	export let canAddToCart: boolean;

	let className = '';
	export { className as class };
	const { t } = useI18n();
</script>

<div
	class="relative mx-auto max-w-max tagWidget tagWidget-main flex flex-wrap gap-4 p-6 rounded {className}"
>
	<div class="flex flex-col gap-2 mb-4">
		<div class="flex flex-col gap-2 justify-between">
			<a href="/product/{product._id}" class="flex flex-col">
				<h2 class="text-2xl body-title">{product.name}</h2>
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
				<span class="font-semibold">{t('vatExcluded')}</span>
			</div>
		</div>
		<a href="/product/{product._id}" class="flex flex-col">
			<p class="mt-2 text-gray-800 max-w-[500px]">
				{product.shortDescription}
			</p>
		</a>
		{#if canAddToCart}
			<div class="flex flex-row items-end justify-end">
				<AddToCart {product} picture={pictures[0]} class="btn cartPreview-mainCTA" />
			</div>
		{/if}
	</div>
	<div class="flex flex-col">
		<div class="flex flex-row justify-end -mt-6 -mr-6">
			<ProductType
				{product}
				{hasDigitalFiles}
				class="last:rounded-tr first:rounded-bl pl-2 text-sm"
			/>
		</div>
		<a href="/product/{product._id}" class="-mr-6">
			<PictureComponent picture={pictures[0]} class="object-contain max-h-[264px] max-w-[264px]" />
		</a>
	</div>
</div>
