<script lang="ts">
	import { generateId } from '$lib/utils/generateId';
	import PictureComponent from '$lib/components/Picture.svelte';

	export let data;
	let name = data.gallery.name;
	let slug = data.gallery._id;
	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this gallery?')) {
			event.preventDefault();
		}
	}
	$: pictureById = Object.fromEntries(data.pictures.map((picture) => [picture._id, picture]));
</script>

<form method="post" class="flex flex-col gap-4" action="?/update">
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
		<input
			class="form-input"
			type="text"
			name="principal.title"
			value={data.gallery.principal.content}
			placeholder="Gallery title"
		/>
	</label>
	<label class="form-label">
		Gallery content
		<textarea
			name="principal.content"
			value={data.gallery.principal.content}
			cols="30"
			rows="5"
			maxlength="10000"
			class="form-input"
		/>
	</label>
	<div class="flex gap-4">
		<label class="form-label">
			Text
			<input
				type="text"
				name="principal.cta.label"
				class="form-input"
				value={data.gallery.principal.cta.label}
			/>
		</label>
		<label class="form-label">
			Url
			<input
				type="text"
				name="principal.cta.href"
				class="form-input"
				value={data.gallery.principal.cta.href}
			/>
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
				value={data.gallery.secondary[i]?.title || ''}
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
				value={data.gallery.secondary[i]?.content || ''}
			/>
		</label>
		<div class="flex flex-col">
			<a
				href="{data.adminPrefix}/picture/{data.gallery.secondary[i]?.pictureId}"
				class="flex flex-col"
			>
				<PictureComponent
					picture={pictureById[data.gallery.secondary[i]?.pictureId || '']}
					class="h-36 block"
					style="object-fit: scale-down;"
				/>
			</a>
			<input
				type="hidden"
				name="secondary[{i}].pictureId"
				class="form-input"
				value={data.gallery.secondary[i]?.pictureId}
			/>
		</div>
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input
					type="text"
					name="secondary[{i}].cta.label"
					class="form-input"
					value={data.gallery.secondary[i]?.cta.label || ''}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="secondary[{i}].cta.href"
					class="form-input"
					value={data.gallery.secondary[i]?.cta.href || ''}
				/>
			</label>
		</div>
	{/each}

	<div class="flex flex-row justify-between gap-2">
		<input type="submit" class="btn btn-blue self-start text-white" value="Update" />
		<a href="/gallery/{data.gallery._id}" class="btn btn-gray">View</a>

		<button
			type="submit"
			class="ml-auto btn btn-red"
			formaction="?/delete"
			on:click={confirmDelete}
		>
			Delete
		</button>
	</div>
</form>
