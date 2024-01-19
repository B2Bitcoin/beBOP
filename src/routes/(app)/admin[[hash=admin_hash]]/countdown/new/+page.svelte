<script lang="ts">
	import {
		MAX_DESCRIPTION_LIMIT,
		MAX_NAME_LIMIT,
		MAX_SHORT_DESCRIPTION_LIMIT
	} from '$lib/types/Product';
	import { generateId } from '$lib/utils/generateId';
	import { addDays } from 'date-fns';

	let title: string;
	let slug: string;
	let beginsAt = new Date().toJSON().slice(0, 10);
	let endsAt = addDays(new Date(), 2).toJSON().slice(0, 10);
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
</script>

<h1 class="text-3xl">Add a specification</h1>

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
			on:change={() => (slug = generateId(title, true))}
			on:input={() => (slug = generateId(title, true))}
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
			required
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
	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
