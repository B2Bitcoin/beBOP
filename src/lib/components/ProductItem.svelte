<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from './Picture.svelte';

	export let picture: Picture | undefined;
	export let product: Pick<Product, '_id' | 'name'>;
</script>

<div class="flex flex-col text-center">
	<a href="/product/{product._id}" class="flex flex-col items-center">
		<PictureComponent {picture} class="block h-36" />
		<span class="mt-2 line-clamp-3 text-ellipsis max-w-[192px] break-words hyphens-auto"
			>{product.name}</span
		>
	</a>
</div>
