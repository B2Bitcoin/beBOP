<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import ProductWidgetVariation1 from './ProductWidget/ProductWidgetVariation1.svelte';
	import ProductWidgetVariation2 from './ProductWidget/ProductWidgetVariation2.svelte';
	import ProductWidgetVariation3 from './ProductWidget/ProductWidgetVariation3.svelte';
	import ProductWidgetVariation4 from './ProductWidget/ProductWidgetVariation4.svelte';
	import ProductWidgetVariation5 from './ProductWidget/ProductWidgetVariation5.svelte';
	import ProductWidgetVariation6 from './ProductWidget/ProductWidgetVariation6.svelte';
	import { typedInclude } from '$lib/utils/typedIncludes';
	import { typedKeys } from '$lib/utils/typedKeys';
	import ProductWidgetVariation0 from './ProductWidget/ProductWidgetVariation0.svelte';

	export let picture: Picture | undefined;
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
	export let canBuy: boolean;

	let className = '';
	export { className as class };
	export let displayOption = 'img-0';
	$: canAddToCart =
		canBuy && (!product.availableDate || product.availableDate <= new Date() || !!product.preorder);

	const widgets = {
		'img-0': {
			component: ProductWidgetVariation0
		},
		'img-1': {
			component: ProductWidgetVariation1
		},
		'img-2': {
			component: ProductWidgetVariation2
		},
		'img-3': {
			component: ProductWidgetVariation3
		},
		'img-4': {
			component: ProductWidgetVariation4
		},
		'img-5': {
			component: ProductWidgetVariation5
		},
		'img-6': {
			component: ProductWidgetVariation6
		}
	};

	$: widget = typedInclude(typedKeys(widgets), displayOption)
		? widgets[displayOption]
		: widgets['img-0'];
</script>

{#if widget}
	<svelte:component
		this={widget.component}
		{product}
		{picture}
		{pictures}
		{hasDigitalFiles}
		{canAddToCart}
		class={className}
	/>
{/if}

<!-- {#if displayOption === 'img-1' || displayOption === 'txt-1'}
	<div class="{baseClasses} {className}">
		<div class="flex flex-row justify-end -mt-6 -mr-6">
			<ProductType {product} {hasDigitalFiles} class="last:rounded-tr first:rounded-bl pl-2" />
		</div>
		<div class="flex flex-col text-center">
			<a href="/product/{product._id}" class="flex flex-col items-center">
				<PictureComponent {picture} class="object-contain max-h-[348px] max-w-full" />
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
			{#if displayOption === 'img-1'}
				<a href="/product/{product._id}" class="flex flex-col">
					<p class="mt-2 text-gray-800">
						{product.shortDescription}
					</p>
				</a>
			{/if}

			{#if canAddToCart}
				<AddToCart {product} {picture} />
			{/if}
		</div>
	</div>
{:else if displayOption === 'img-2'}
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
				<PictureComponent {picture} class="object-contain max-h-[264px] max-w-[264px]" />
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
				<AddToCart {product} {picture} />
			{/if}
		</div>
	</div>
{:else if displayOption === 'img-3'}
	<div class="relative mx-auto max-w-max bg-gray-240 flex flex-wrap gap-4 p-6 rounded {className}">
		<div class="flex flex-col gap-2 mb-4">
			<div class="flex flex-col gap-2 justify-between">
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
				<AddToCart {product} {picture} />
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
				<PictureComponent {picture} class="object-contain max-h-[264px] max-w-[264px]" />
			</a>
		</div>
	</div>
{:else if displayOption === 'img-4'}
	<div
		class="relative mx-auto max-w-[264px] bg-gray-240 flex flex-col gap-4 p-6 rounded {className}"
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
				<PictureComponent {picture} sizes="264px" class="object-contain" />
			</a>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex flex-col gap-2 justify-between">
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

			{#if canAddToCart}
				<AddToCart {product} {picture} />
			{/if}
		</div>
	</div>
{:else}
	<div class="{baseClasses} {className}">
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
{/if} -->
