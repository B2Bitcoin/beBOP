<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let picturesByProduct = Object.fromEntries(
		[...data.pictures].reverse().map((picture) => [picture.productId, picture])
	);
</script>

<main class="p-4">
	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each data.products as product}
			<div class="flex flex-col text-center">
				<a href="/resource/{product._id}" class="flex flex-col items-center">
					<Picture picture={picturesByProduct[product._id]} class="block h-36" />
					<span class="mt-2">{product.name}</span>
				</a>
			</div>
		{/each}
	</div>
</main>
