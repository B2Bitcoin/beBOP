<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';

	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6 flex flex-col gap-4 items-start">
	<h1 class="text-3xl">
		Subscription {data.subscription.number}
	</h1>

	<ProductItem product={data.product} picture={data.picture} />

	<p>Associated to npub: {data.subscription.npub}</p>

	<p>
		Initially created: <time datetime={data.subscription.createdAt.toJSON()}
			>{new Date(data.subscription.createdAt).toLocaleString('en-UK')}</time
		>
	</p>

	<p>
		Paid until: <time datetime={data.subscription.paidUntil.toJSON()}
			>{new Date(data.subscription.paidUntil).toLocaleString('en-UK')}</time
		>
		{#if data.subscription.paidUntil < new Date()}
			<span class="text-red-500">(expired)</span>
		{/if}
	</p>

	<form action="?/renew">
		<button
			class="btn btn-black"
			disabled={!data.canRenew}
			title={data.canRenew ? '' : 'Subscription not due for renewal'}>Renew</button
		>
	</form>
</main>
