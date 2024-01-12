<script lang="ts">
	import type { LanguageKey } from '$lib/translations/index.js';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage.js';
	import { MAX_NAME_LIMIT } from '$lib/types/Product';

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
		Title
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="title"
			placeholder="title"
			value={data.contactForm.translations?.[language]?.title ?? ''}
			required
		/>
	</label>

	<label class="form-label">
		Subject
		<input
			class="form-input block"
			type="text"
			name="subject"
			placeholder="Subject"
			value={data.contactForm.translations?.[language]?.subject ?? ''}
			required
		/>
	</label>
	Content

	<textarea
		name="content"
		cols="30"
		rows="10"
		maxlength={MAX_CONTENT_LIMIT}
		value={data.contactForm.translations?.[language]?.content ?? ''}
		placeholder="message"
		class="form-input block w-full"
	/>

	<button class="btn btn-black self-start" type="submit">Save</button>
</form>
