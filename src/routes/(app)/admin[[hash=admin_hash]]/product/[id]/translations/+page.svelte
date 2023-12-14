<script lang="ts">
	import type { LanguageKey } from '$lib/translations/index.js';
	import { MAX_DESCRIPTION_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';

	export let data;

	let language: LanguageKey = 'fr';
</script>

<form method="post" class="contents">
	<label class="form-label">
		Select Language

		<select bind:value={language} name="language" class="form-input">
			<option value="en">English</option>
			<option value="fr">French</option>
		</select>
	</label>

	<label class="form-label">
		Name
		<input
			type="text"
			name="name"
			class="form-input"
			placeholder={data.product.name}
			value={data.product.translations?.[language]?.name ?? ''}
		/>
	</label>

	<label class="form-label">
		Description
		<textarea
			name="description"
			class="form-input"
			rows="10"
			maxlength={MAX_DESCRIPTION_LIMIT}
			placeholder={data.product.description}
			value={data.product.translations?.[language]?.description ?? ''}
		/>
	</label>

	<label class="form-label">
		Short Description
		<textarea
			name="shortDescription"
			class="form-input"
			rows="2"
			maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
			placeholder={data.product.shortDescription}
			value={data.product.translations?.[language]?.shortDescription ?? ''}
		/>
	</label>

	<label class="form-label">
		Custom Preorder Text
		<input
			type="text"
			name="customPreorderText"
			class="form-input"
			placeholder={data.product.customPreorderText}
			value={data.product.translations?.[language]?.customPreorderText ?? ''}
		/>
	</label>

	<label class="form-label">
		Content Before
		<textarea
			class="form-input"
			name="contentBefore"
			value={data.product.translations?.[language]?.contentBefore ?? ''}
			placeholder={data.product.contentBefore ?? ''}
		/>
	</label>

	<label class="form-label">
		Content After
		<textarea
			class="form-input"
			name="contentAfter"
			value={data.product.translations?.[language]?.contentAfter ?? ''}
			placeholder={data.product.contentAfter ?? ''}
		/>
	</label>

	{#each [...(data.product.translations?.[language]?.cta || []), ...Array(3).fill( { href: '', label: '' } )].slice(0, 3) as link, i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input
					type="text"
					name="cta[{i}].label"
					class="form-input"
					value={link.label}
					placeholder={data.product.cta?.[i]?.label}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="cta[{i}].href"
					class="form-input"
					value={link.href}
					placeholder={data.product.cta?.[i]?.href}
				/>
			</label>
		</div>
	{/each}

	<button class="btn btn-black self-start" type="submit">Save</button>
</form>
