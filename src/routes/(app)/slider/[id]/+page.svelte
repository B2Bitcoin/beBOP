<script>
	import CarouselWidget from '$lib/components/CarouselWidget.svelte';

	export let data;
</script>

<CarouselWidget autoplay={3000} pictures={data.pictures} />
