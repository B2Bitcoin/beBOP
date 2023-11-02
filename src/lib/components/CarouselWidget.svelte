<script lang="ts">
	import { Carousel } from 'flowbite-svelte';
	import type { Picture } from '$lib/types/Picture';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let pictures: Picture[];
	export let autoplay: number;

	let images = pictures.map((picture) => ({
		alt: picture.name,
		srcset: picture.storage.formats
			.map((format) => `/picture/raw/${picture?._id}/format/${format.width} ${format.width}w`)
			.join(', '),
		title: picture.name,
		url: picture.slider?.url
	}));

	const scaleAnimation = (x: any) => scale(x, { duration: 500, easing: quintOut });
</script>

<div class="mx-auto max-w-4xl">
	<Carousel {images} duration={autoplay} transition={scaleAnimation} let:Indicators>
		<a slot="slide" href={images[index]?.url} target="_blank" let:Slide let:index>
			<Slide image={images[index]} />
		</a>
		<Indicators />
	</Carousel>
</div>
