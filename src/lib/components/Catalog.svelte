<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import ProductItem from './ProductItem.svelte';

	export let products: Pick<Product, '_id' | 'price' | 'name'>[];
	export let pictures: Picture[];

	let picturesByProduct = Object.fromEntries(
		[...pictures].reverse().map((picture) => [picture.productId, picture])
	);
</script>

<main class="p-4">
	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each products as product}
			<ProductItem {product} picture={picturesByProduct[product._id]} />
		{/each}
	</div>
</main>
