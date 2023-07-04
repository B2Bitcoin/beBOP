<script lang="ts">
	import ProductWidget from '$lib/components/ProductWidget.svelte';
	import { page } from '$app/stores';

	export let data;
	const img = $page.url.searchParams.get('img');
	const txt = $page.url.searchParams.get('txt');
</script>

<ProductWidget
	product={data.product}
	picture={data.picture}
	exchangeRate={data.exchangeRate}
	displayOption={img ? 'img-' + img : txt ? 'txt-' + txt : 'img-0'}
/>
