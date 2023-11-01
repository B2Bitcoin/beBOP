<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency.js';

	export let data;

	let minAmount: number = data.existingThreshold.minAmount;
	let maxAmount: number = data.existingThreshold.maxAmount;
	let confirmationBlocks: number = data.existingThreshold.confirmationBlocks;
	let currency: string = data.existingThreshold.currency;
</script>

<a href="/admin/config/confirmation-threshold">Cancel</a>

<h1 class="text-3xl">Edit confirmation threshold</h1>

<form method="post" action="?/update" class="flex flex-col gap-4">
	<label class="w-full">
		Min amount
		<input
			bind:value={minAmount}
			class="form-input max-w-[25rem]"
			type="number"
			name="minAmount"
			placeholder="Price"
			step="any"
			required
		/>
	</label>
	<label class="w-full">
		Max amount
		<input
			class="form-input max-w-[25rem]"
			type="number"
			min={minAmount}
			bind:value={maxAmount}
			name="maxAmount"
			placeholder="Price"
			step="any"
			required
		/>
	</label>
	<label class="form-label">
		Currency
		<select name="currency" bind:value={currency} class="form-input max-w-[25rem]">
			{#each CURRENCIES.filter((c) => c !== 'SAT') as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</label>
	<label class="w-full">
		Confirmation blocks
		<input
			type="number"
			bind:value={confirmationBlocks}
			min="0"
			step="1"
			name="confirmationBlocks"
			class="form-input max-w-[25rem]"
			required
		/>
	</label>
	{#if confirmationBlocks === 0}
		<p class="text-red-600">This might be risky!</p>
	{/if}

	<div class="flex gap-2">
		<button class="btn btn-red" formaction="?/delete">Delete</button>
		<button type="submit" class="btn btn-black self-start"> Update </button>
	</div>
</form>
