<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';

	export let data;

	let picturesByProduct = Object.fromEntries(
		[...data.pictures].reverse().map((picture) => [picture.productId, picture])
	);
	let hideArchiveProduct = false;
</script>

<a href="/admin/product/new" class="underline block">Add product</a>
<a href="/admin/product/prices" class="underline block">Products price</a>
<a href="/admin/product/perk" class="underline block">Perk page</a>

<h1 class="text-3xl">List of products</h1>

<label class="checkbox-label">
	<input
		type="checkbox"
		name="vatSingleCountry"
		class="form-checkbox"
		bind:checked={hideArchiveProduct}
	/>
	Hide archived products
</label>

<div class="flex flex-row flex-wrap gap-6">
	{#each data.products as product}
		<ProductItem {product} picture={picturesByProduct[product._id]} isAdmin />
	{/each}
</div>
