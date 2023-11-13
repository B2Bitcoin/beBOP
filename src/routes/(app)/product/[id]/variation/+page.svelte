<script>
	import ProductWidgetVariation5 from '$lib/components/ProductWidget/ProductWidgetVariation5.svelte';

	export let data;
</script>

<ProductWidgetVariation5
	product={data.product}
	picture={data.pictures[0]}
	pictures={data.pictures}
/>
