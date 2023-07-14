<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from './Picture.svelte';
	import PriceTag from './PriceTag.svelte';
	import ProductType from './ProductType.svelte';
	import AddToCart from './AddToCart.svelte';

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
	export let hasDigitalFiles: boolean;

	let className = '';
	export { className as class };
	export let displayOption = 'img-0';

	$: canAddToCart =
		!product.availableDate || product.availableDate <= new Date() || !!product.preorder;
	$: baseClasses = 'relative mx-auto max-w-[800px] bg-gray-240 flex flex-col gap-4 p-6 rounded';
</script>

{#if displayOption === 'img-1' || displayOption === 'txt-1'}
	<div class="{baseClasses} {className}">
		<div class="flex flex-row justify-end -mt-6 -mr-6">
			<ProductType {product} {hasDigitalFiles} class="last:rounded-tr first:rounded-bl pl-2" />
		</div>
		<div class="flex flex-col text-center">
			<a href="/product/{product._id}" class="flex flex-col items-center">
				<PictureComponent {picture} sizes="800px" class="object-contain max-h-[348px] max-w-full" />
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
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={product.price.amount}
						currency={product.price.currency}
						convertedTo="EUR"
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
	<div class="relative mx-auto max-w-max bg-gray-240 flex flex-row gap-4 p-6 rounded {className}">
		<div class="flex flex-col">
			<div class="flex flex-row justify-start -mt-6 -ml-6">
				<ProductType
					{product}
					{hasDigitalFiles}
					class="last:rounded-tr first:rounded-bl pl-2 text-sm"
				/>
			</div>
			<a href="/product/{product._id}" class="-ml-6">
				<PictureComponent
					{picture}
					sizes="800px"
					class="object-contain max-h-[264px] max-w-[264px]"
				/>
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
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={product.price.amount}
						currency={product.price.currency}
						convertedTo="EUR"
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
	<div class="relative mx-auto max-w-max bg-gray-240 flex flex-row gap-4 p-6 rounded {className}">
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
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={product.price.amount}
						currency={product.price.currency}
						convertedTo="EUR"
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
				<PictureComponent
					{picture}
					sizes="800px"
					class="object-contain max-h-[264px] max-w-[264px]"
				/>
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
				<PictureComponent {picture} sizes="800px" class="object-contain" />
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
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={product.price.amount}
						currency={product.price.currency}
						convertedTo="EUR"
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
				<PictureComponent {picture} sizes="800px" class="object-contain max-h-[174px] max-w-full" />
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
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={product.price.amount}
						currency={product.price.currency}
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
				<AddToCart {product} {picture} />
			{/if}
		</div>
	</div>
{/if}
