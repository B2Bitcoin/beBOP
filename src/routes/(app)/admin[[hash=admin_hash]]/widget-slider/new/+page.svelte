<script lang="ts">
	import { MAX_NAME_LIMIT } from '$lib/types/Product';
	import { generateId } from '$lib/utils/generateId';

	let title: string;
	let slug: string;
</script>

<h1 class="text-3xl">Add a slider</h1>

<form method="post" class="flex flex-col gap-4">
	<label class="form-label">
		title
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="title"
			placeholder="title"
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

	<label class="form-label"
		>Line
		<input type="text" name="lines" class="form-input" />
		<input type="text" name="lines" class="form-input" />
		<input type="text" name="lines" class="form-input" />
	</label>

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
