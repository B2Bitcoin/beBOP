<script lang="ts">
	import ProductWidget from '$lib/components/ProductWidget.svelte';
	import { page } from '$app/stores';

	export let data;
	const display = $page.url.searchParams.get('display');
</script>

<ProductWidget
	product={data.product}
	picture={data.picture}
	displayOption={display ? display : 'img-0'}
	hasDigitalFiles={data.digitalFiles.length >= 1}
/>
