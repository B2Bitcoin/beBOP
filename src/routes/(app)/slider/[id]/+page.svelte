<script>
	import CarouselWidget from '$lib/components/CarouselWidget.svelte';

	export let data;
</script>

<CarouselWidget pictures={data.pictures} />
