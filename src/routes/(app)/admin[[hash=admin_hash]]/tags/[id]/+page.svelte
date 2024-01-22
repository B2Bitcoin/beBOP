<script lang="ts">
	import { generateId } from '$lib/utils/generateId';
	import { upperFirst } from '$lib/utils/upperFirst';
	import PictureComponent from '$lib/components/Picture.svelte';

	export let data;
	let name = data.tag.name;
	let slug = data.tag._id;
	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this tag?')) {
			event.preventDefault();
		}
	}
</script>

<form method="post" class="flex flex-col gap-4" action="?/update">
	<label class="form-label">
		tag name
		<input
			class="form-input"
			type="text"
			name="name"
			placeholder="Tag name"
			bind:value={name}
			on:change={() => (slug = generateId(name, false))}
			on:input={() => (slug = generateId(name, false))}
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
			disabled
		/>
	</label>
	<label class="checkbox-label">
		<input
			class="form-checkbox"
			type="checkbox"
			bind:checked={data.tag.widgetUseOnly}
			name="widgetUseOnly"
		/>
		For widget use only
	</label>
	<label class="checkbox-label">
		<input
			class="form-checkbox"
			type="checkbox"
			bind:checked={data.tag.productTagging}
			name="productTagging"
		/>
		Available for product tagging
	</label>
	<label class="checkbox-label">
		<input
			class="form-checkbox"
			type="checkbox"
			bind:checked={data.tag.useLightDark}
			name="useLightDark"
		/>
		Use light/dark inverted mode
	</label>
	<div class="flex flex-col gap-4 w-[20em]">
		<label class="form-label">
			Tag family
			<select class="form-input" name="family" value={data.tag.family}>
				{#each ['creators', 'events', 'retailers', 'temporal'] as family}
					<option value={family}>{upperFirst(family)}</option>
				{/each}
			</select>
		</label>
	</div>

	<label class="form-label">
		Tag title
		<input
			class="form-input"
			type="text"
			bind:value={data.tag.title}
			name="title"
			placeholder="Tag title"
			required
		/>
	</label>
	<label class="form-label">
		Tag subtitle
		<input
			class="form-input"
			type="text"
			bind:value={data.tag.subtitle}
			name="subtitle"
			placeholder="Tag subtitle"
			required
		/>
	</label>
	<label class="form-label">
		Short content
		<textarea
			name="shortContent"
			bind:value={data.tag.shortContent}
			cols="30"
			rows="2"
			class="form-input"
		/>
	</label>
	<label class="form-label">
		Full content
		<textarea
			name="content"
			bind:value={data.tag.content}
			cols="30"
			rows="10"
			maxlength="10000"
			class="form-input"
		/>
	</label>

	<h3 class="text-xl">CTAs</h3>
	{#each [0, 1, 2] as i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input
					type="text"
					name="cta[{i}].label"
					class="form-input"
					value={data.tag.cta[i]?.label || ''}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="cta[{i}].href"
					class="form-input"
					value={data.tag.cta[i]?.href || ''}
				/>
			</label>
		</div>
	{/each}
	<h3 class="text-xl">Links menu</h3>
	{#each [0, 1, 2, 3, 4] as i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input
					type="text"
					name="menu[{i}].label"
					class="form-input"
					value={data.tag.menu[i]?.label || ''}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="menu[{i}].href"
					class="form-input"
					value={data.tag.menu[i]?.href || ''}
				/>
			</label>
		</div>
	{/each}
	<label class="form-label">
		CSS override
		<textarea
			name="cssOverride"
			bind:value={data.tag.cssOveride}
			cols="30"
			rows="10"
			maxlength="10000"
			class="form-input"
		/>
	</label>
	<div class="flex flex-row justify-between gap-2">
		<input type="submit" class="btn btn-blue self-start text-white" value="Update" />
		<a href="/tag/{data.tag._id}" class="btn btn-gray">View</a>

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

<h2 class="text-2xl my-4">Photos</h2>
{#if data.pictures.length < 5}
	<a href="/admin/picture/new?tagId={data.tag._id}" class="underline">Add picture</a>
{/if}
<div class="flex flex-row flex-wrap gap-6 mt-6">
	{#each data.pictures as picture}
		<div class="flex flex-col text-center">
			<a href="{data.adminPrefix}/picture/{picture._id}" class="flex flex-col items-center">
				<PictureComponent {picture} class="h-36 block" style="object-fit: scale-down;" />
				<span>{picture.name} / {picture.tag ? picture.tag.type : ''}</span>
			</a>
		</div>
	{/each}
</div>
