<script lang="ts">
	import { generateId } from '$lib/utils/generateId';
	import { upperFirst } from '$lib/utils/upperFirst';

	let name = '';
	let slug = '';
</script>

<h1 class="text-3xl">Add a tag</h1>

<form method="post" class="flex flex-col gap-4">
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
		/>
	</label>
	<label class="checkbox-label">
		<input class="form-checkbox" type="checkbox" name="widgetUseOnly" />
		For widget use only
	</label>
	<label class="checkbox-label">
		<input class="form-checkbox" type="checkbox" name="productTagging" />
		Available for product tagging
	</label>
	<label class="checkbox-label">
		<input class="form-checkbox" type="checkbox" name="useLightDark" />
		Use light/dark inverted mode
	</label>
	<div class="flex flex-col gap-4 w-[20em]">
		<label class="form-label">
			Tag family
			<select class="form-input" name="family">
				{#each ['creators', 'events', 'retailers', 'temporal'] as family}
					<option value={family}>{upperFirst(family)}</option>
				{/each}
			</select>
		</label>
	</div>

	<label class="form-label">
		Tag title
		<input class="form-input" type="text" name="title" placeholder="Tag title" required />
	</label>
	<label class="form-label">
		Tag subtitle
		<input class="form-input" type="text" name="subtitle" placeholder="Tag subtitle" required />
	</label>
	<label class="form-label">
		Short content
		<textarea name="shortContent" cols="30" rows="2" class="form-input" />
	</label>
	<label class="form-label">
		Full content
		<textarea name="content" cols="30" rows="10" maxlength="10000" class="form-input" />
	</label>

	<h3 class="text-xl">CTAs</h3>
	{#each [0, 1, 2] as i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input type="text" name="ctaLinks[{i}].label" class="form-input" />
			</label>
			<label class="form-label">
				Url
				<input type="text" name="ctaLinks[{i}].href" class="form-input" />
			</label>
		</div>
	{/each}
	<h3 class="text-xl">Links menu</h3>
	{#each [0, 1, 2, 3, 4] as i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input type="text" name="menuLinks[{i}].label" class="form-input" />
			</label>
			<label class="form-label">
				Url
				<input type="text" name="menuLinks[{i}].href" class="form-input" />
			</label>
		</div>
	{/each}
	<label class="form-label">
		CSS override
		<textarea name="cssOverride" cols="30" rows="10" maxlength="10000" class="form-input" />
	</label>
	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
