<script lang="ts">
	import type { Picture } from '$lib/types/Picture';

	export let picture: Picture | undefined;
	export let minStorage = 0;
</script>

{#if picture}
	<img
		alt={picture.name}
		srcset={picture.storage.formats
			.slice(minStorage)
			.map((format) => `/pictures/raw/${picture?._id}/format/${format.width} ${format.width}w`)
			.join(', ')}
		{...$$restProps}
		on:click
		on:load
	/>
{:else}
	zz
{/if}

<style>
	img.hover-zoom {
		transition: 400ms;

		transform: scale(1);
	}

	img:hover.hover-zoom {
		transform: scale(1.2);
	}
</style>
