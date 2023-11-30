<script lang="ts">
	import ListOrder from '$lib/components/ListOrder.svelte';

	export let data;
</script>

<h1 class="text-3xl">List of orders</h1>

<ListOrder
	orders={data.orders}
	priceReference={data.currencies.priceReference}
	showForms={true}
	adminPrefix={data.adminPrefix}
/>
