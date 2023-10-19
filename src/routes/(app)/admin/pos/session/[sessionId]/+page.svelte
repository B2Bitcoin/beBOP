<script lang="ts">
	export let data;
</script>

<div>
	{data.session.sessionId}
</div>

<h1>Cart :</h1>

<div class="flex flex-col flex-wrap gap-2">
	{#if data?.cart?.items?.length}
		{#each data.cart.items as items}
			<div>{items.productId}</div>
		{/each}
	{/if}
</div>
