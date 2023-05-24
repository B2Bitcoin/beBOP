<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let picturesByProduct = Object.fromEntries(
		[...data.pictures].reverse().map((picture) => [picture.productId, picture])
	);
</script>

<a href="/admin/product/new" class="underline block">Add product</a>

<h1 class="text-3xl">List of products</h1>

<div class="flex flex-row flex-wrap gap-6">
	{#each data.products as product}
		<div class="flex flex-col text-center">
			<a href="/admin/product/{product._id}" class="flex flex-col items-center">
				<Picture picture={picturesByProduct[product._id]} class="block h-36" />
				<span class="mt-2 line-clamp-3 text-ellipsis max-w-[191px] break-words hyphens-auto"
					>{product.name}</span
				>
			</a>
		</div>
	{/each}
</div>
