<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';
	import { downloadFile } from '$lib/utils/downloadFile.js';

	export let data;

	let eshopVisible = data.productActionSettings.eShop.visible;
	let retailVisible = data.productActionSettings.retail.visible;
	let googleShoppingVisible = data.productActionSettings.googleShopping.visible;
	let eshopBasket = data.productActionSettings.eShop.canBeAddedToBasket;
	let retailBasket = data.productActionSettings.retail.canBeAddedToBasket;

	let picturesByProduct = Object.fromEntries(
		[...data.pictures].reverse().map((picture) => [picture.productId, picture])
	);

	async function exportData() {
		const response = await fetch(`${data.adminPrefix}/backup/create`, {
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

<a href="{data.adminPrefix}/product/new" class="underline block">Add product</a>
<a href="{data.adminPrefix}/product/prices" class="underline block">Products price</a>
<a href="{data.adminPrefix}/product/alias" class="underline block">Products aliases</a>
<button on:click={exportData} class="btn btn-black self-start">Export catalog</button>
<a href="{data.adminPrefix}/backup/import?type=catalog" class="btn btn-black self-start"
	>Import catalog</a
>

<form method="post" class="flex flex-col gap-4" action="?/update">
	<h3 class="text-xl">Default action settings</h3>
	<table class="w-full border border-gray-300 divide-y divide-gray-300">
		<thead class="bg-gray-200">
			<tr>
				<th class="py-2 px-4 border-r border-gray-300">Action</th>
				<th class="py-2 px-4 border-r border-gray-300">Eshop (anyone)</th>
				<th class="py-2 px-4 border-r border-gray-300">Retail (POS logged seat)</th>
				<th class="py-2 px-4">Google Shopping</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="py-2 px-4 border-r border-gray-300">Product is visible</td>
				<td class="py-2 px-4 border-r border-gray-300 text-center">
					<input type="checkbox" bind:checked={eshopVisible} name="eshopVisible" class="rounded" />
				</td>
				<td class="py-2 px-4 border-r border-gray-300 text-center">
					<input
						type="checkbox"
						bind:checked={retailVisible}
						name="retailVisible"
						class="rounded"
					/>
				</td>
				<td class="py-2 px-4 border-r border-gray-300 text-center">
					<input
						type="checkbox"
						bind:checked={googleShoppingVisible}
						name="googleShoppingVisible"
						class="rounded"
					/>
				</td>
			</tr>
			<tr>
				<td class="py-2 px-4 border border-gray-300">Product can be added to basket</td>
				<td class="py-2 px-4 border border-gray-300 text-center">
					<input type="checkbox" bind:checked={eshopBasket} name="eshopBasket" class="rounded" />
				</td>
				<td class="py-2 px-4 border border-gray-300 text-center">
					<input type="checkbox" bind:checked={retailBasket} name="retailBasket" class="rounded" />
				</td>
				<td class="py-2 px-4 border border-gray-300 text-center" />
			</tr>
		</tbody>
	</table>
	<button type="submit" class="btn btn-blue self-start">Update</button>
</form>

<h1 class="text-3xl">List of products</h1>

<div class="flex flex-row flex-wrap gap-6">
	{#each data.products as product}
		<ProductItem {product} picture={picturesByProduct[product._id]} isAdmin />
	{/each}
</div>
