<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';

	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<h1 class="text-3xl">
		Subscription {data.subscription.number}
	</h1>

	<ProductItem product={data.product} picture={data.picture} />

	<p>
		Paid until: <time datetime={data.subscription.paidUntil.toJSON()}
			>{new Date(data.subscription.paidUntil).toLocaleString('en-UK')}</time
		>
		{#if data.subscription.paidUntil < new Date()}
			<span class="text-red-500">(expired)</span>
		{/if}
	</p>

	<form action="?/renew">
		<button class="btn btn-black">Renew</button>
	</form>
</main>
