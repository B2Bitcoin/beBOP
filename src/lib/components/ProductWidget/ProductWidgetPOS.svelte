<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import type { Product } from '$lib/types/Product';
	import PictureComponent from '../Picture.svelte';

	export let pictures: Picture[] | [];
	export let product: Pick<Product, 'name' | '_id' | 'price'>;

	let className = '';
	export { className as class };
</script>

<div class="touchScreen-product-cta flex flex-row {className}">
	<div>
		<a href="/product/{product._id}">
			<PictureComponent picture={pictures[0]} class="object-contain h-24 w-24" />
		</a>
	</div>
	<div class="p-4 flex items-center justify-center">
		<a href="/product/{product._id}">
			<h2 class="text-3xl">{product.name}</h2>
		</a>
	</div>
</div>
