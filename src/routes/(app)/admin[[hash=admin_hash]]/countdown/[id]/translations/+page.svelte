<script lang="ts">
	import type { LanguageKey } from '$lib/translations/index.js';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage.js';
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';

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
		Short description
		<textarea
			name="shortDescription"
			class="form-input"
			rows="10"
			maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
			placeholder={data.countdown.shortDescription}
			value={data.countdown.translations?.[language]?.shortDescription ?? ''}
		/>
	</label>

	<label class="form-label">
		Description
		<textarea
			name="description"
			class="form-input"
			rows="10"
			maxlength={MAX_CONTENT_LIMIT}
			placeholder={data.countdown.description}
			value={data.countdown.translations?.[language]?.description ?? ''}
		/>
	</label>

	<button class="btn btn-black self-start" type="submit">Save</button>
</form>
