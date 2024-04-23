<script lang="ts">
	import { Carousel } from 'flowbite-svelte';
	import type { Picture } from '$lib/types/Picture';

	export let pictures: Picture[];
	export let autoplay: number;
	let className = '';
	export { className as class };
	let images = pictures.map((picture) => ({
		alt: picture.name,
		srcset: picture.storage.formats
			.map((format) => `/picture/raw/${picture?._id}/format/${format.width} ${format.width}w`)
			.join(', '),
		title: picture.name,
		slide: picture.slider
	}));
</script>

<div class={className}>
	<Carousel {images} duration={autoplay} transition={null} let:Indicators>
		<a
			slot="slide"
			href={images[index].slide?.url}
			target={images[index].slide?.openNewTab ? '_blank' : '_self'}
			let:Slide
			let:index
			on:click|preventDefault={() => {
				// We need to prevent default here because otherwise the link will be opened twice
				// We have custom handling for mobile devices, because the click event is absorbed by the gesture handler
				const url = images[index].slide?.url;
				if (url) {
					if (images[index].slide?.openNewTab) {
						window.open(url, '_blank');
					} else {
						window.location.href = url;
					}
				}
			}}
		>
			<Slide image={images[index]} />
		</a>
		{#if images.length > 1}
			<Indicators />
		{/if}
	</Carousel>
</div>
