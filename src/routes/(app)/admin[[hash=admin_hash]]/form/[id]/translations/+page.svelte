<script lang="ts">
	import { languageNames, locales, type LanguageKey } from '$lib/translations/index.js';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage.js';

	export let data;

	let language: LanguageKey = 'fr';
</script>

<form method="post" class="contents">
	<label class="form-label">
		Select Language

		<select bind:value={language} name="language" class="form-input">
			{#each locales as locale}
				<option value={locale}>{languageNames[locale]}</option>
			{/each}
		</select>
	</label>

	<label class="form-label">
		Subject
		<input
			class="form-input block"
			type="text"
			name="subject"
			placeholder={data.contactForm.subject}
			value={data.contactForm.translations?.[language]?.subject ?? ''}
		/>
	</label>
	Content

	<textarea
		name="content"
		cols="30"
		rows="10"
		maxlength={MAX_CONTENT_LIMIT}
		value={data.contactForm.translations?.[language]?.content ?? ''}
		placeholder={data.contactForm.content}
		class="form-input block w-full"
	/>

	<button class="btn btn-black self-start" type="submit">Save</button>
</form>
