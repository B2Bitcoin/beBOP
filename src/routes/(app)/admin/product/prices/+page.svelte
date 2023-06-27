<script lang="ts">
	export let data;

	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const productId = target.name;
		const newPrice = target.value;

		if (newPrice && parseFloat(newPrice) < 0.00000001) {
			target.setCustomValidity('Price ' + productId + ' must be greater than 1 SAT');
			target.reportValidity();
			event.preventDefault();
			return;
		} else {
			target.setCustomValidity('');
		}
	}
</script>

<h1 class="text-3xl">Bulk Price Change</h1>

<form class="flex flex-col gap-2" method="post">
	{#each data.products as product}
		<label class="form-label">
			{product.name} (price)
			<input
				type="number"
				name={product._id}
				value={product.price.amount}
				class="form-input"
				placeholder="Price (BTC)"
				step="any"
				required
				on:input={handleInputChange}
			/>
		</label>
	{/each}
	<button class="btn btn-black self-start" type="submit">Update</button>
</form>
