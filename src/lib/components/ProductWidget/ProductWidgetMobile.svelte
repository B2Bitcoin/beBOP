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

	let className = '';
	export { className as class };
	const { t } = useI18n();
</script>

<div class="mx-auto tagWidget tagWidget-main flex flex-row gap-4 rounded {className}">
	<div class="flex-col grid">
		<div class="flex-row justify-start">
			<ProductType {product} {hasDigitalFiles} class="last:rounded-tr first:rounded-bl text-sm" />
		</div>
		<a href="/product/{product._id}">
			<PictureComponent picture={pictures[0]} class="object-contain max-h-full max-w-[164px]" />
		</a>
	</div>
	<div class="grid flex-col gap-2">
		<div class="flex flex-col gap-2">
			<a href="/product/{product._id}" class="flex flex-col">
				<h2 class="text-2xl body-title">{product.name}</h2>
			</a>

			<div class="flex flex-row">
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
		<a href="/product/{product._id}" class="flex flex-col">
			<p class="max-w-[500px]">
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Minima nam maiores asperiores,
			</p>
		</a>
	</div>
</div>
