<script lang="ts">
	import type { LanguageKey } from '$lib/translations';

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
			type="text"
			name="title"
			class="form-input"
			placeholder={data.tag.title}
			value={data.tag.translations?.[language]?.title ?? ''}
		/>
	</label>

	<label class="form-label">
		Subtitle
		<input
			type="text"
			name="subtitle"
			class="form-input"
			placeholder={data.tag.subtitle}
			value={data.tag.translations?.[language]?.subtitle ?? ''}
		/>
	</label>

	<label class="form-label">
		Short content
		<textarea
			name="shortContent"
			cols="30"
			rows="2"
			class="form-input"
			value={data.tag.translations?.[language]?.shortContent ?? ''}
		/>
	</label>

	<label class="form-label">
		Full content

		<textarea
			name="content"
			class="form-input"
			rows="10"
			cols="30"
			maxlength="10000"
			placeholder={data.tag.content}
			value={data.tag.translations?.[language]?.content ?? ''}
		/>
	</label>

	<button class="btn btn-black self-start" type="submit">Save</button>
</form>
