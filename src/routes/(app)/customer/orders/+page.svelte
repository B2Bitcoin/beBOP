<script lang="ts">
	import ListOrder from '$lib/components/ListOrder.svelte';

	export let data;
</script>

<h1 class="text-3xl">List of your orders</h1>

<ListOrder
	orders={data.orders}
	priceReference={data.currencies.priceReference}
	showForms={false}
	adminPrefix={data.adminPrefix}
/>
