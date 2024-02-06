<script>
	import GalleryWidget from '$lib/components/GalleryWidget/GalleryWidget.svelte';

	export let data;
</script>

<GalleryWidget pictures={data.pictures} gallery={data.gallery} />
