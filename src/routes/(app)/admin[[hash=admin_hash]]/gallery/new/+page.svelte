<script lang="ts">
	import { generateId } from '$lib/utils/generateId';

	let name = '';
	let slug = '';

	let submitting = false;
</script>

<h1 class="text-3xl">Add a gallery</h1>

<form method="post" class="flex flex-col gap-4">
	<label class="form-label">
		Gallery name
		<input
			class="form-input"
			type="text"
			name="name"
			placeholder="Gallery name"
			bind:value={name}
			on:change={() => (slug = generateId(name, false))}
			on:input={() => (slug = generateId(name, false))}
			required
		/>
	</label>
	<label class="form-label">
		Gallery slug
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
	<h3 class="text-xl">Principal Gallery</h3>
	<label class="form-label">
		Gallery title
		<input class="form-input" type="text" name="principal.title" placeholder="Gallery title" />
	</label>
	<label class="form-label">
		Gallery content
		<textarea name="principal.content" cols="30" rows="5" maxlength="10000" class="form-input" />
	</label>
	<div class="flex gap-4">
		<label class="form-label">
			Text
			<input type="text" name="principal.cta.label" class="form-input" />
		</label>
		<label class="form-label">
			Url
			<input type="text" name="principal.cta.href" class="form-input" />
		</label>
	</div>

	<h3 class="text-xl">Secondary Gallery</h3>
	{#each [0, 1, 2] as i}
		<label class="form-label">
			Gallery subtitle {i + 1}
			<input
				class="form-input"
				type="text"
				name="secondary[{i}].title"
				placeholder="Gallery title"
			/>
		</label>
		<label class="form-label">
			Gallery subcontent {i + 1}
			<textarea
				name="secondary[{i}].content"
				cols="30"
				rows="5"
				maxlength="10000"
				class="form-input"
			/>
		</label>
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input type="text" name="secondary[{i}].cta.label" class="form-input" />
			</label>
			<label class="form-label">
				Url
				<input type="text" name="secondary[{i}].cta.href" class="form-input" />
			</label>
		</div>
	{/each}

	<input
		type="submit"
		class="btn btn-blue self-start text-white"
		value="Submit"
		disabled={submitting}
	/>
</form>
