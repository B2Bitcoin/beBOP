<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import PictureComponent from '$lib/components/Picture.svelte';
	import type { Picture } from '$lib/types/Picture';

	export let pictures: Picture[];
</script>

<Carousel class="w-full mt-4 h-[36rem] ">
	{#each pictures as picture}
		<div class="w-full h-full flex items-center justify-around">
			<a
				href={picture.slider?.url}
				target={picture.slider?.openNewTab ? '_blank' : '_self'}
				class="flex flex-col items-center"
			>
				<PictureComponent {picture} class="w-auto h-90 block" style="object-fit: scale-down;" />
			</a>
		</div>
	{/each}
</Carousel>
