<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';
	import { downloadFile } from '$lib/utils/downloadFile.js';

	export let data;

	let picturesByProduct = Object.fromEntries(
		[...data.pictures].reverse().map((picture) => [picture.productId, picture])
	);

	async function exportData() {
		const response = await fetch('/admin/backup/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ exportType: 'product' })
		});

		if (!response.ok) {
			alert('Error ' + response.status + ': ' + (await response.text()));
		}

		const blob = await response.blob();
		downloadFile(blob, 'backup.json');
	}
</script>

<a href="/admin/product/new" class="underline block">Add product</a>
<a href="/admin/product/prices" class="underline block">Products price</a>
<button on:click={exportData} class="btn btn-black self-start">Export catalog</button>
<a href="/admin/backup/import?type=catalog" class="btn btn-black self-start">Import catalog</a>

<h1 class="text-3xl">List of products</h1>

<div class="flex flex-row flex-wrap gap-6">
	{#each data.products as product}
		<ProductItem {product} picture={picturesByProduct[product._id]} isAdmin />
	{/each}
</div>
