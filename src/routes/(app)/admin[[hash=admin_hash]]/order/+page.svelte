<script lang="ts">
	import OrdersList from '$lib/components/OrdersList.svelte';
	import { ORDER_PAGINATION_LIMIT } from '$lib/types/Order';
	import { page } from '$app/stores';

	export let data;
	let next = 0;
</script>

<h1 class="text-3xl">List of orders</h1>
<form class="flex flex-col gap-2" method="get">
	<div class="gap-4 flex flex-col md:flex-row">
		<label class="form-label w-[30em]">
			Search Order
			<input
				class="form-input"
				type="number"
				name="orderNumber"
				placeholder="search order by number"
			/>
		</label>
		<label class="form-label w-[30em]">
			Product alias
			<input
				class="form-input"
				type="text"
				name="productAlias"
				value={$page.url.searchParams.get('productAlias')}
				placeholder="search order by product alias"
			/>
		</label>
		<label class="form-label w-[2em] mt-8">
			<input type="submit" value="🔍" class="btn btn-gray" /></label
		>
	</div>
</form>
<OrdersList orders={data.orders} adminPrefix={data.adminPrefix} />
<div class="flex gap-2">
	{#if Number($page.url.searchParams.get('skip'))}
		<a
			class="btn btn-blue"
			on:click={() => (next = Math.max(0, next - ORDER_PAGINATION_LIMIT))}
			href="?skip={next}">Previous</a
		>
	{/if}
	{#if data.orders.length >= ORDER_PAGINATION_LIMIT}
		<a class="btn btn-blue" on:click={() => (next += ORDER_PAGINATION_LIMIT)} href="?skip={next}"
			>Next</a
		>
	{/if}
</div>
