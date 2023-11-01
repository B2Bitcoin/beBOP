<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency';

	let minAmount: number;
	let confirmationBlocks: number;
</script>

<h1 class="text-3xl">Add confirmation threshold</h1>

<form method="post" class="flex flex-col gap-4">
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
			name="maxAmount"
			placeholder="Price"
			step="any"
			required
		/>
	</label>
	<label class="form-label">
		Currency
		<select name="currency" class="form-input max-w-[25rem]">
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

	<button type="submit" class="btn btn-black self-start"> Create </button>
</form>
