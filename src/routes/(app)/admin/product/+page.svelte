<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';

	export let data;

	let picturesByProduct = Object.fromEntries(
		[...data.pictures].reverse().map((picture) => [picture.productId, picture])
	);

	async function exportData() {
		const response = await fetch('/admin/config/backup/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ exportType: 'product' })
		});

		if (!response.ok) {
			throw new Error('Network response was not ok' + response.statusText);
		}

		const blob = await response.blob();
		const link = document.createElement('a');

		link.href = window.URL.createObjectURL(blob);
		link.download = 'backup.json';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<a href="/admin/product/new" class="underline block">Add product</a>
<a href="/admin/product/prices" class="underline block">Products price</a>
<button on:click={exportData} class="btn btn-black self-start">Export catalog</button>

<h1 class="text-3xl">List of products</h1>

<div class="flex flex-row flex-wrap gap-6">
	{#each data.products as product}
		<ProductItem {product} picture={picturesByProduct[product._id]} isAdmin />
	{/each}
</div>
