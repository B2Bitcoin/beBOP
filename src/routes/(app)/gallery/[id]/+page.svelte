<script>
	import GallerySlide from '$lib/components/GallerySlide.svelte';
	import GalleryWidget from '$lib/components/GalleryWidget/GalleryWidget.svelte';

	export let data;
</script>

<GalleryWidget pictures={data.pictures} gallery={data.gallery} />
<GallerySlide pictures={data.pictures} gallery={data.gallery} />
