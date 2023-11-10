<script>
	import ProductWidgetVariationOne from '$lib/components/ProductWidget/ProductWidgetVariationOne.svelte';
	import ProductWidgetVariationTwo from '$lib/components/ProductWidget/ProductWidgetVariationTwo.svelte';

	export let data;
</script>

<ProductWidgetVariationOne
	product={data.product}
	picture={data.pictures[0]}
	pictures={data.pictures}
/>
<ProductWidgetVariationTwo
	product={data.product}
	picture={data.pictures[0]}
	pictures={data.pictures}
/>
