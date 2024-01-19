<script lang="ts">
	import {
		MAX_DESCRIPTION_LIMIT,
		MAX_NAME_LIMIT,
		MAX_SHORT_DESCRIPTION_LIMIT
	} from '$lib/types/Product';
	import { addDays } from 'date-fns';

	export let data;
	let title = data.countdown.title;
	let slug = data.countdown._id;
	let beginsAt = data.beginsAt;
	let endsAt = data.endsAt;
	let endsAtElement: HTMLInputElement;

	function checkForm(event: SubmitEvent) {
		if (endsAt < beginsAt) {
			endsAtElement.setCustomValidity('End date must be after beginning date');
			endsAtElement.reportValidity();
			event.preventDefault();
			return;
		} else {
			endsAtElement.setCustomValidity('');
		}
	}
	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this specification?')) {
			event.preventDefault();
		}
	}
</script>

<form method="post" class="flex flex-col gap-4" on:submit={checkForm}>
	<label class="form-label">
		Title
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="title"
			placeholder="Countdown title"
			bind:value={title}
			required
		/>
	</label>

	<label class="form-label">
		Slug
		<input
			class="form-input block"
			type="text"
			name="slug"
			placeholder="Slug"
			bind:value={slug}
			title="Only lowercase letters, numbers and dashes are allowed"
			disabled
		/>
	</label>
	<label class="form-label">
		Short description
		<textarea
			name="shortDescription"
			cols="30"
			rows="5"
			maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
			placeholder="Countdown short description"
			class="form-input block w-full"
			value={data.countdown.shortDescription}
			required
		/>
	</label>
	<label class="form-label">
		Description
		<textarea
			name="description"
			cols="30"
			rows="10"
			maxlength={MAX_DESCRIPTION_LIMIT}
			placeholder="Countdown description"
			class="form-input block w-full"
			value={data.countdown.description}
			required
		/>
	</label>
	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			Begin At
			<input class="form-input" type="date" name="beginsAt" required bind:value={beginsAt} />
		</label>
	</div>
	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			End At
			<input
				class="form-input"
				type="date"
				required
				name="endsAt"
				min={addDays(new Date(), 1).toJSON().slice(0, 10)}
				bind:value={endsAt}
				bind:this={endsAtElement}
				on:input={() => endsAtElement?.setCustomValidity('')}
			/>
		</label>
	</div>
	<div class="flex flex-row justify-between gap-2">
		<input type="submit" class="btn btn-blue text-white" formaction="?/update" value="Update" />
		<a href="/countdown/{data.countdown._id}" class="btn btn-gray">View</a>

		<input
			type="submit"
			class="btn btn-red text-white ml-auto"
			formaction="?/delete"
			value="Delete"
			on:click={confirmDelete}
		/>
	</div>
</form>
