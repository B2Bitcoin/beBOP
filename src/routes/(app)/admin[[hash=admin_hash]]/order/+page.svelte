<script lang="ts">
	import OrdersList from '$lib/components/OrdersList.svelte';

	export let data;
</script>

<h1 class="text-3xl">List of orders</h1>

<OrdersList orders={data.orders} adminPrefix={data.adminPrefix} />
