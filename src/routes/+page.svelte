<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let picturesByProduct = Object.fromEntries(
		[...data.pictures].reverse().map((picture) => [picture.productId, picture])
	);
</script>

<main class="p-4">
	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each data.products as product}
			<ProductItem {product} picture={picturesByProduct[product._id]} />
		{/each}
	</div>
</main>
