<script lang="ts">
	import { languageNames, locales, type LanguageKey } from '$lib/translations/index.js';
	import { MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';

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
		Brand name
		<input
			type="text"
			name="brandName"
			class="form-input"
			placeholder={data.defaultConfig.brandName}
			value={data.config?.[language]?.brandName ?? ''}
		/>
	</label>

	<label class="form-label">
		Website title
		<input
			type="text"
			name="websiteTitle"
			class="form-input"
			placeholder={data.defaultConfig.websiteTitle}
			value={data.config?.[language]?.websiteTitle ?? ''}
		/>
	</label>

	<label class="form-label">
		Website description

		<textarea
			name="websiteShortDescription"
			class="form-input"
			rows="2"
			cols="30"
			maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
			placeholder={data.defaultConfig.websiteShortDescription}
			>{data.config?.[language]?.websiteShortDescription ?? ''}</textarea
		>
	</label>

	<h2 class="text-2xl">Top bar links</h2>

	{#each [...(data.config?.[language]?.topbarLinks ?? []), { href: '', label: '' }] as link, i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input
					type="text"
					name="topbarLinks[{i}].label"
					placeholder={data.defaultConfig.topbarLinks[i]?.label ?? ''}
					class="form-input"
					value={link.label}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="topbarLinks[{i}].href"
					class="form-input"
					placeholder={data.defaultConfig.topbarLinks[i]?.href ?? ''}
					value={link.href}
				/>
			</label>
		</div>
	{/each}

	<h2 class="text-2xl">Nav bar links</h2>

	{#each [...(data.config?.[language]?.navbarLinks ?? []), { href: '', label: '' }] as link, i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input
					type="text"
					name="navbarLinks[{i}].label"
					class="form-input"
					value={link.label}
					placeholder={data.defaultConfig.navbarLinks[i]?.label ?? ''}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="navbarLinks[{i}].href"
					class="form-input"
					value={link.href}
					placeholder={data.defaultConfig.navbarLinks[i]?.href ?? ''}
				/>
			</label>
		</div>
	{/each}

	<h2 class="text-2xl">Footer links</h2>

	{#each [...(data.config?.[language]?.footerLinks ?? []), { href: '', label: '' }] as link, i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input
					type="text"
					name="footerLinks[{i}].label"
					class="form-input"
					value={link.label}
					placeholder={data.defaultConfig.footerLinks[i]?.label ?? ''}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="footerLinks[{i}].href"
					class="form-input"
					value={link.href}
					placeholder={data.defaultConfig.footerLinks[i]?.href ?? ''}
				/>
			</label>
		</div>
	{/each}

	<button class="btn btn-black self-start" type="submit">Save</button>
</form>
