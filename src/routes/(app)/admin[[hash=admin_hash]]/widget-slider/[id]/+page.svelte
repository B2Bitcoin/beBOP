<script lang="ts">
	import { MAX_NAME_LIMIT } from '$lib/types/Product';
	import { generateId } from '$lib/utils/generateId';

	export let data;
	let name = data.widgetSlider.title;
	let slug = data.widgetSlider._id;
	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this widget slider?')) {
			event.preventDefault();
		}
	}
</script>

<h1 class="text-3xl">Edit a widget slider</h1>

<form method="post" class="flex flex-col gap-4" action="?/update">
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
			disabled
		/>
	</label>
	<label class="form-label">
		Slider title
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="title"
			placeholder="Slider name"
			bind:value={name}
			on:change={() => (slug = generateId(name, true))}
			on:input={() => (slug = generateId(name, true))}
			required
		/>
	</label>
	<label class="form-label"
		>Line
		{#each [...data.widgetSlider.lines, ''] as line}
			<input type="text" name="lines" class="form-input" value={line} />
		{/each}
	</label>
	<div class="flex flex-row justify-between gap-2">
		<input type="submit" class="btn btn-blue text-white" value="Update" />
		<a href="/widget-slider/{data.widgetSlider._id}" class="btn btn-gray">View</a>

		<input
			type="submit"
			class="btn btn-red text-white ml-auto"
			formaction="?/delete"
			value="Delete"
			on:click={confirmDelete}
		/>
	</div>
</form>
