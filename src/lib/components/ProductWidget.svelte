<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from './Picture.svelte';
	import PriceTag from './PriceTag.svelte';

	export let picture: Picture | undefined;
	export let product: Pick<Product, '_id' | 'name' | 'price' | 'description'>;
</script>

<div class="flex flex-col text-center">
	<a href="/product/{product._id}" class="flex flex-col items-center">
		<PictureComponent {picture} class="object-contain max-h-[250px] max-w-full" />
	</a>
</div>

<div class="flex flex-col m-6">
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
				convertedTo="EUR"
			/>
		</div>
	</div>
	<a href="/product/{product._id}" class="flex flex-col items-center">
		<p class="text-2xl mt-4 text-gray-800">
			Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestias ex obcaecati voluptate nam
			molestiae, cum natus sed! Quae quod sapiente eius exercitationem eaque, facilis officiis,
			veniam quibusdam magnam, odit sed.
		</p>
	</a>
	<div class="flex flex-row items-end justify-end">
		<button value="Add to cart" formaction="?/addToCart" class="btn btn-gray"> Add to cart </button>
	</div>
</div>
