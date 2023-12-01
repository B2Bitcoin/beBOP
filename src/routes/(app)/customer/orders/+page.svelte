<script lang="ts">
	import OrdersList from '$lib/components/OrdersList.svelte';

	export let data;
</script>

<main class="mx-auto max-w-7xl px-6 body-mainPlan flex flex-col gap-6">
	<h1 class="text-3xl">List of your orders</h1>

	<OrdersList orders={data.orders} />
</main>
