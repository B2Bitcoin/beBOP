<script lang="ts">
	import { MAX_NAME_LIMIT } from '$lib/types/Product';
	import { upperFirst } from '$lib/utils/upperFirst';

	export let data;

	let beginsAt = data.beginsAt;
	let endsAt = data.endsAt;
	let endsAtElement: HTMLInputElement;

	function checkForm(event: SubmitEvent) {
		if (data.isEndAtAfterBeginAt) {
			endsAtElement.setCustomValidity('End date must be after beginning date');
			endsAtElement.reportValidity();
			event.preventDefault();
			return;
		} else {
			endsAtElement.setCustomValidity('');
		}
	}

	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this Challenge?')) {
			event.preventDefault();
		}
	}
</script>

<h1 class="text-3xl">Edit a challenge</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4" on:submit={checkForm}>
	<label class="form-label">
		Challenge name
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="name"
			value={data.challenge.name}
			placeholder="Challenge name"
			required
		/>
	</label>

	<label class="form-label">
		Mode
		<select class="form-input" name="mode" bind:value={data.challenge.mode}>
			{#each ['moneyAmount', 'totalProducts'] as option}
				<option value={option}>{upperFirst(option)}</option>
			{/each}
		</select>
	</label>

	<label class="form-label">
		Goal
		<input
			class="form-input"
			type="number"
			name="goalAmount"
			value={data.challenge.goal.amount}
			placeholder={data.challenge.mode === 'moneyAmount' ? 'Amount (SAT)' : 'Quantity'}
			required
		/>
	</label>

	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			Beginning date

			<input class="form-input" type="date" name="beginsAt" bind:value={beginsAt} required />
		</label>
	</div>
	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			Ending date

			<input
				class="form-input"
				type="date"
				required
				name="endsAt"
				bind:value={endsAt}
				bind:this={endsAtElement}
				on:input={() => endsAtElement?.setCustomValidity('')}
			/>
		</label>
	</div>

	<div class="flex flex-row justify-between gap-2">
		<input type="submit" class="btn btn-blue text-white" formaction="?/update" value="Update" />
		<a href="/{data.challenge._id}" class="btn btn-gray">View</a>

		<input
			type="submit"
			class="btn btn-red text-white ml-auto"
			formaction="?/delete"
			value="Delete"
			on:click={confirmDelete}
		/>
	</div>
</form>
