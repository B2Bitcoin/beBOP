<script lang="ts">
	export let data;
	console.log('Coucouu ', data);
</script>

<div>
	{data.session._id}
</div>

<h1>Cart :</h1>

<div class="flex flex-col flex-wrap gap-2">
	{#each data.cart.items as items}
		<div>{items.productId}</div>
	{/each}
</div>
