<script lang="ts">
	import { Carousel } from 'flowbite-svelte';
	import type { Picture } from '$lib/types/Picture';

	export let pictures: Picture[];
	export let autoplay: number;

	let images = pictures.map((picture) => ({
		alt: picture.name,
		srcset: picture.storage.formats
			.map((format) => `/picture/raw/${picture?._id}/format/${format.width} ${format.width}w`)
			.join(', '),
		title: picture.name,
		slide: picture.slider
	}));
</script>

<div class="mx-auto mb-5">
	<Carousel {images} duration={autoplay} transition={null} let:Indicators>
		<a
			slot="slide"
			href={images[index].slide?.url}
			target={images[index].slide?.openNewTab ? '_blank' : '_self'}
			let:Slide
			let:index
		>
			<Slide image={images[index]} />
		</a>
		<Indicators />
	</Carousel>
</div>
