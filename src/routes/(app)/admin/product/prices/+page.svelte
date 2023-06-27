<script lang="ts">
	import { bind } from 'svelte/internal';

	export let data;

	let priceAmount: number;
	let priceAmountElement: HTMLInputElement;

	function checkForm(event: SubmitEvent) {
		if (priceAmountElement.value && priceAmount < 0.00000001) {
			priceAmountElement.setCustomValidity('Price must be greater than 1 SAT');
			priceAmountElement.reportValidity();
			event.preventDefault();
			return;
		} else {
			priceAmountElement.setCustomValidity('');
		}
	}
</script>

<h1 class="text-3xl">Bulk Price Change</h1>

<form class="flex flex-col gap-2" method="post" on:submit={checkForm}>
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
				bind:this={priceAmountElement}
				on:input={() => priceAmountElement?.setCustomValidity('')}
				required
			/>
		</label>
	{/each}
	<button class="btn btn-black self-start" type="submit">Update</button>
</form>
