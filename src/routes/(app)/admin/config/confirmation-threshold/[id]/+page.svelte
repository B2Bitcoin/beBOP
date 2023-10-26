<script lang="ts">
	export let data;

	let minAmount: number = data.existingThresholds.minAmount;
	let maxAmount: number = data.existingThresholds.maxAmount;
	let confirmationBlocks: number = data.existingThresholds.confirmationBlocks;
</script>

<h1 class="text-3xl">Edit confirmation treeshold</h1>

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

	<div class="flex gap-2">
		<button class="btn btn-red" formaction="?/delete">Delete</button>
		<button type="submit" class="btn btn-black self-start"> Update </button>
	</div>
</form>
