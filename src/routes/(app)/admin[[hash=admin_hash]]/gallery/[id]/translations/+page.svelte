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

	<h3 class="text-xl">Principal Gallery</h3>
	<label class="form-label">
		Gallery title
		<input
			class="form-input"
			type="text"
			name="principal.title"
			placeholder={data.gallery.principal.title}
			value={data.gallery.translations?.[language]?.principal?.title ?? ''}
		/>
	</label>
	<label class="form-label">
		Gallery content
		<textarea
			name="principal.content"
			placeholder={data.gallery.principal.content}
			value={data.gallery.translations?.[language]?.principal?.content ?? ''}
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
				placeholder={data.gallery.principal.cta.label}
				value={data.gallery.translations?.[language]?.principal?.cta?.label ?? ''}
			/>
		</label>
		<label class="form-label">
			Url
			<input
				type="text"
				name="principal.cta.href"
				class="form-input"
				placeholder={data.gallery.principal.cta.href}
				value={data.gallery.translations?.[language]?.principal?.cta?.href ?? ''}
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
				maxlength="30"
				placeholder={data.gallery.secondary[i]?.title}
				value={data.gallery.translations?.[language]?.secondary?.[i]?.title || ''}
			/>
		</label>
		<label class="form-label">
			Gallery subcontent {i + 1}
			<textarea
				name="secondary[{i}].content"
				cols="30"
				rows="5"
				maxlength="150"
				class="form-input"
				placeholder={data.gallery.secondary[i]?.content}
				value={data.gallery.translations?.[language]?.secondary?.[i]?.content || ''}
			/>
		</label>
		<input
			type="hidden"
			name="secondary[{i}].pictureId"
			class="form-input"
			value={data.gallery.secondary[i].pictureId || ''}
		/>

		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input
					type="text"
					name="secondary[{i}].cta.label"
					class="form-input"
					placeholder={data.gallery.secondary[i]?.cta.label || ''}
					value={data.gallery.translations?.[language]?.secondary?.[i]?.cta?.label || ''}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="secondary[{i}].cta.href"
					class="form-input"
					placeholder={data.gallery.secondary[i]?.cta.href || ''}
					value={data.gallery.translations?.[language]?.secondary?.[i]?.cta?.href || ''}
				/>
			</label>
		</div>
	{/each}

	<button class="btn btn-black self-start" type="submit">Save</button>
</form>
