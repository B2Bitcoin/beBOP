<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';
	import PriceTag from '../PriceTag.svelte';
	import ProductType from '../ProductType.svelte';
	import AddToCart from '../AddToCart.svelte';
	import { useI18n } from '$lib/i18n';
	import type { ProductWidgetProduct } from './ProductWidgetProduct';

	export let pictures: Picture[] | [];
	export let product: ProductWidgetProduct;
	export let hasDigitalFiles: boolean;
	export let canAddToCart: boolean;

	let className = '';
	export { className as class };
	const { t } = useI18n();
</script>

<div
	class="relative mx-auto max-w-[264px] tagWidget tagWidget-main flex flex-col gap-4 p-6 rounded {className}"
>
	<div class="flex flex-col">
		<div class="flex flex-row justify-end -mt-6 -mr-6">
			<ProductType
				{product}
				{hasDigitalFiles}
				class="last:rounded-tr first:rounded-bl pl-2 text-sm"
			/>
		</div>
		<a href="/product/{product._id}" class="-mx-6">
			<PictureComponent picture={pictures[0]} sizes="264px" class="object-contain" />
		</a>
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-2 justify-between">
			<a href="/product/{product._id}" class="flex flex-col">
				<h2 class="text-2xl body-title">{product.name}</h2>
			</a>

			<div class="flex flex-row gap-2">
				<PriceTag
					amount={product.price.amount}
					currency={product.price.currency}
					class="text-2xl"
					main
				/>
				<PriceTag
					class="text-base"
					amount={product.price.amount}
					currency={product.price.currency}
					secondary
				/>
			</div>
			<span class="font-semibold">{t('product.vatExcluded')}</span>
		</div>

		{#if canAddToCart && !product.hasSellDisclaimer}
			<div class="flex flex-row items-end justify-end">
				<AddToCart {product} picture={pictures[0]} class="btn cartPreview-mainCTA" />
			</div>
		{/if}
	</div>
</div>
