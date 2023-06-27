<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Bulk Price Change</h1>

<form class="flex flex-col gap-2" method="post">
	{#each data.products as product}
		<label class="form-label">
			Prix - {product.name}
			<input
				type="number"
				name={product._id}
				value={product.price.amount}
				class="form-input"
				placeholder="Price (BTC)"
				step="any"
				required
			/>
		</label>
	{/each}
	<button class="btn btn-black self-start" type="submit">Update</button>
</form>
