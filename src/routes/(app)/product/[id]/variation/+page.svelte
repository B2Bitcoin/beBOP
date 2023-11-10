<script>
	import ProductWidgetVariationOne from '$lib/components/ProductWidget/ProductWidgetVariationOne.svelte';

	export let data;
</script>

<ProductWidgetVariationOne
	product={data.product}
	picture={data.pictures[0]}
	pictures={data.pictures}
/>
