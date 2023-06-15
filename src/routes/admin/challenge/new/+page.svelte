<script lang="ts">
	import { MAX_NAME_LIMIT } from '$lib/types/Product';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays } from 'date-fns';

	let mode = 'money amount';
</script>

<h1 class="text-3xl">Add a challenge</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4">
	<label>
		Challenge name
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="name"
			placeholder="Challenge name"
			required
		/>
	</label>

	<label>
		Mode
		<select class="form-input" name="mode" bind:value={mode}>
			{#each ['money amount', 'order quantity'] as mode}
				<option value={mode}>{upperFirst(mode)}</option>
			{/each}
		</select>
	</label>

	{#if mode == 'money amount'}
		<label>
			Goal
			<input
				class="form-input"
				type="number"
				name="goalAmount"
				placeholder="Amount (SAT)"
				required
			/>
		</label>
	{:else}
		<label>
			Goal
			<input
				class="form-input"
				type="number"
				name="goalAmount"
				placeholder="Quantity"
				required
			/>
		</label>
	{/if}


	<div class="flex flex-wrap gap-4">
		<label>
			Ending date

			<input
				class="form-input"
				type="date"
				name="endsAt"
				min={addDays(new Date(), 1).toJSON().slice(0, 10)}
			/>
		</label>
	</div>

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
