<script lang="ts">
	import ProductWidget from '$lib/components/ProductWidget.svelte';

	export let data;
</script>

<ProductWidget product={data.product} picture={data.picture} exchangeRate={data.exchangeRate} />
