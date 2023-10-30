<script lang="ts">
	export let form;

	let minAmount: number;
</script>

{#if form?.success}
	<p class="alert-success">Values updated</p>
{/if}

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
	<label class="w-full">
		Confirmation blocks
		<input
			type="number"
			min="0"
			step="1"
			name="confirmationBlocks"
			class="form-input max-w-[25rem]"
			required
		/>
	</label>

	<button type="submit" class="btn btn-black self-start"> Create </button>
</form>
