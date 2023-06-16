<script lang="ts">
	import { MAX_NAME_LIMIT } from '$lib/types/Product';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays } from 'date-fns';

	let mode = 'moneyAmount';
	let beginsAt = '';
	let endsAt = addMonths(new Date(), 30).toJSON().slice(0, 10);
	let endsAtElement: HTMLInputElement;

	function checkForm(event: SubmitEvent) {
		if (endsAtElement.value && endsAt < beginsAt) {
			endsAtElement.setCustomValidity('End date must be after beginning date');
			endsAtElement.reportValidity();
			event.preventDefault();
			return;
		} else {
			endsAtElement.setCustomValidity('');
		}
	}
</script>

<h1 class="text-3xl">Add a challenge</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4" on:submit={checkForm}>
	<label class="form-label">
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

	<label class="form-label">
		Mode
		<select class="form-input" name="mode" bind:value={mode}>
			{#each ['moneyAmount', 'totalProducts'] as mode}
				<option value={mode}>{upperFirst(mode)}</option>
			{/each}
		</select>
	</label>

	{#if mode == 'moneyAmount'}
		<label class="form-label">
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
		<label class="form-label">
			Goal
			<input class="form-input" type="number" name="goalAmount" placeholder="Quantity" required />
		</label>
	{/if}

	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			Beginning date

			<input
				class="form-input"
				type="date"
				name="beginsAt"
				min={addDays(new Date(), 1).toJSON().slice(0, 10)}
				bind:value={beginsAt}
			/>
		</label>
	</div>
	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			Ending date

			<input
				class="form-input"
				type="date"
				name="endsAt"
				min={addDays(new Date(), 1).toJSON().slice(0, 10)}
				bind:value={endsAt}
				bind:this={endsAtElement}
				on:input={() => endsAtElement?.setCustomValidity('')}
			/>
		</label>
	</div>

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
