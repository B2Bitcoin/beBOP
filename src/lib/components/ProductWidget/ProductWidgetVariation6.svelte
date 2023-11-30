<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';

	import AddToCart from '../AddToCart.svelte';

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

	let pictureId = 0;
</script>

<div class="flex flex-col rounded p-4 sm:flex-row sm:gap-2 {className}">
	<div class="ml-0 sm:ml-4 w-full sm:w-1/6 flex-col hidden sm:inline">
		{#if pictures.length > 1}
			{#each pictures.slice(0, 3) as picture, i}
				<button type="button" on:click={() => (pictureId = i)}>
					<PictureComponent
						{picture}
						class="w-[100px] h-[100px] border-gray-300 border rounded object-cover mb-2 {pictureId ===
						i
							? 'ring-2 ring-link ring-offset-2'
							: ''} "
					/>
				</button>
			{/each}
		{/if}
	</div>
	<div class="flex flex-wrap tagWidget tagWidget-main w-full sm:w-5/6 mb-4 sm:mb-0">
		<div class="justify-center w-full sm:w-1/3 mt-4 sm:mt-0">
			<a href="/product/{product._id}">
				<PictureComponent
					picture={pictures[pictureId]}
					class="h-[280px] mt-5 mr-auto object-contain"
				/>
			</a>
		</div>
		<div class="p-4 w-full sm:w-2/3">
			<a href="/product/{product._id}">
				<h2 class="text-2xl font-bold body-title mb-2">{product.name}</h2>
			</a>
			<a href="/product/{product._id}">
				<p class="text-gray-600 mb-4">{product.shortDescription}</p>
			</a>
			{#if canAddToCart}
				<div class="relative">
					<div class="flex flex-wrap gap-6 items-end">
						<AddToCart
							{product}
							picture={pictures[0]}
							btnTranslationKey="product.cta.buy"
							class="cartPreview-mainCTA text-xl text-center w-full md:w-[150px] p-1"
							detailBtn={true}
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
