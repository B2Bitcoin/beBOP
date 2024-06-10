<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import type { Product } from '$lib/types/Product';
	import PictureComponent from '../Picture.svelte';
	import DEFAULT_PICTURE from '$lib/assets/default-product.png';

	export let pictures: Picture[] | [];
	export let product: Pick<Product, 'name' | '_id' | 'price'>;

	let className = '';
	export { className as class };
</script>

<div class="touchScreen-product-cta flex flex-row {className}">
	<div>
		<a href="/product/{product._id}">
			{#if pictures.length > 0 && pictures[0]}
				<PictureComponent picture={pictures[0]} class="object-contain h-24 w-24" />
			{:else}
				<img class="object-contain h-24 w-48" src={DEFAULT_PICTURE} alt="default-img" />
			{/if}
		</a>
	</div>
	<div class="p-4 flex items-center justify-center">
		<a href="/product/{product._id}">
			<h2 class="text-3xl">{product.name}</h2>
		</a>
	</div>
</div>
