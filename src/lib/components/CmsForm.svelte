<script lang="ts">
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
	import Editor from '@tinymce/tinymce-svelte';
	import {
		TINYMCE_PLUGINS,
		TINYMCE_TOOLBAR
	} from '../../routes/(app)/admin[[hash=admin_hash]]/cms/tinymce-plugins';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';

	export let cmsPage: {
		_id: string;
		title: string;
		shortDescription: string;
		fullScreen: boolean;
		hideFromSEO?: boolean;
		desktopDisplayOnly?: boolean;
		mobileDisplaySubstitution?: boolean;
		hasSubstitutionTarget?: boolean;
		maintenanceDisplay: boolean;
		content: string;
		substitutionSlug?: string;
	} | null;

	export let slug = cmsPage?._id || '';
	let pageContent = cmsPage?.content || '';
	let title = cmsPage?.title || '';
	let shortDescription = cmsPage?.shortDescription || '';
	let fullScreen = cmsPage?.fullScreen || false;
	let maintenanceDisplay = cmsPage?.maintenanceDisplay || false;
	let hideFromSEO = cmsPage?.hideFromSEO || false;
	let desktopDisplayOnly = cmsPage?.desktopDisplayOnly || false;
	let mobileDisplaySubstitution = cmsPage?.mobileDisplaySubstitution || false;
	let hasSubstitutionTarget = cmsPage?.hasSubstitutionTarget || false;
	let substitutionSlug = cmsPage?.substitutionSlug || '';
	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this CMS page?')) {
			event.preventDefault();
		}
	}
	function preventSubmit(event: Event) {
		if (desktopDisplayOnly && mobileDisplaySubstitution) {
			alert(
				'CMS page cannot be desktop-only AND mobile display substitution. Please check your setting and disable at least of of the page display type options.'
			);
			event.preventDefault();
		}
		if (mobileDisplaySubstitution && hasSubstitutionTarget) {
			alert(
				'Mobile-only CMS pages cannot have a target substitution page on mobile devices. Please check your settings and disable page display type or page substitution on mobile devices option.'
			);
			event.preventDefault();
		}
	}
</script>

<form method="post" class="flex flex-col gap-4">
	<label>
		Page slug
		<input
			class="form-input block"
			type="text"
			placeholder="Page slug"
			name="slug"
			value={slug}
			disabled={!!cmsPage}
			required
		/>
	</label>

	<label>
		Page title
		<input
			class="form-input block"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="title"
			placeholder="Page title"
			value={title}
			required
		/>
	</label>

	<label>
		Short description
		<textarea
			name="shortDescription"
			cols="30"
			rows="2"
			placeholder="Shown in social media previews"
			maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
			class="form-input block w-full"
			value={shortDescription}
		/>
	</label>

	<label class="checkbox-label">
		<input type="checkbox" name="fullScreen" checked={fullScreen} class="form-checkbox" />
		Full screen
	</label>

	<label class="checkbox-label">
		<input
			type="checkbox"
			name="maintenanceDisplay"
			checked={maintenanceDisplay}
			class="form-checkbox"
		/>
		Available even in Maintenance mode
	</label>
	<label class="checkbox-label">
		<input type="checkbox" name="hideFromSEO" checked={hideFromSEO} class="form-checkbox" />
		Hide this page from search engines
	</label>

	<label class="checkbox-label">
		<input
			type="checkbox"
			name="desktopDisplayOnly"
			bind:checked={desktopDisplayOnly}
			class="form-checkbox"
		/>
		This page is designed for desktop only
	</label>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="mobileDisplaySubstitution"
			bind:checked={mobileDisplaySubstitution}
			class="form-checkbox"
		/>
		This page is designed for mobile display substitution
	</label>
	<label class="block w-full mt-4">
		Content
		<label class="checkbox-label">
			<input
				type="checkbox"
				name="hasSubstitutionTarget"
				bind:checked={hasSubstitutionTarget}
				class="form-checkbox"
			/>
			This page has a subtitution target on mobile devices
		</label>
		{#if hasSubstitutionTarget}
			<label>
				Target substitution page slug
				<input
					class="my-2 form-input block"
					type="text"
					placeholder="Substitution Page slug"
					name="substitutionSlug"
					value={substitutionSlug}
					required
				/>
			</label>
		{/if}
		<Editor
			scriptSrc="/tinymce/tinymce.js"
			bind:value={pageContent}
			conf={{ plugins: TINYMCE_PLUGINS, toolbar: TINYMCE_TOOLBAR }}
		/>

		<ul class="text-gray-700 my-3 list-disc ml-4">
			<li>
				To include products, add a paragraph with only <code class="font-mono">[Product=slug]</code
				>, where
				<code class="font-mono">slug</code> is the slug of your product. You can specify the display
				option like this:
				<code class="font-mono">[Product=slug?display=img-1]</code>
			</li>
			<li>
				To include pictures, add a paragraph with only <code class="font-mono">[Picture=slug]</code
				>. You can also set the width, height and fit:
				<code class="font-mono">[Picture=slug width=100 height=100 fit=cover]</code> or
				<code class="font-mono">[Picture=slug width=100 height=100 fit=contain]</code>
			</li>
			<li>
				To include challenges, add a paragraph with only <code class="font-mono"
					>[Challenge=slug]</code
				>, where
				<code class="font-mono">slug</code> is the slug of your challenge
			</li>
			<li>
				To include sliders, add a paragraph with only <code class="font-mono">[Slider=slug]</code>,
				where
				<code class="font-mono">slug</code> is the slug of your slider. You can specify the autoplay
				duration in milliseconds like this:
				<code class="font-mono">[Slider=slug?autoplay=3000]</code>
			</li>
			<li>
				To include a specification widget, add a paragraph with only <code class="font-mono"
					>[Specification=slug]</code
				>, where <code class="font-mono">slug</code> is the slug of your specification.
			</li>
			<li>
				To include a tag widget, add a paragraph with only <code class="font-mono">[Tag=slug]</code
				>, where
				<code class="font-mono">slug</code> is the slug of your tag. You can specify the display
				option like this:
				<code class="font-mono">[Tag=slug?display=var-1]</code>
			</li>
			<li>
				To include a tagProducts widget, add a paragraph with only <code class="font-mono"
					>[TagProducts=slug]</code
				>, where
				<code class="font-mono">slug</code> is the slug of your tag. You can specify the display
				option like this:
				<code class="font-mono">[TagProducts=slug?display=img-3]</code>
			</li>
			<li>
				To include a form widget, add a paragraph with only <code class="font-mono"
					>[Form=slug]</code
				>, where
				<code class="font-mono">slug</code> is the slug of your form.
			</li>
			<li>
				To include a countdown widget, add a paragraph with only <code class="font-mono"
					>[Countdown=slug]</code
				>, where
				<code class="font-mono">slug</code> is the slug of your countdown.
			</li>
			<li>
				To include a specification widget, add a paragraph with only <code class="font-mono"
					>[Specification=slug]</code
				>, where
				<code class="font-mono">slug</code> is the slug of your specification.
			</li>
			<li>
				To include a gallery widget, add a paragraph with only <code class="font-mono"
					>[Gallery=slug]</code
				>, where
				<code class="font-mono">slug</code> is the slug of your gallery. You can specify the display
				option like this:
				<code class="font-mono">[Gallery=slug?display=var-1]</code>
			</li>
		</ul>

		Raw HTML

		<textarea
			name="content"
			cols="30"
			rows="10"
			maxlength={MAX_CONTENT_LIMIT}
			placeholder="HTML content"
			class="form-input block w-full"
			bind:value={pageContent}
		/>
	</label>

	<div class="flex flex-row justify-between gap-2">
		{#if cmsPage}
			<input
				type="submit"
				class="btn btn-blue text-white"
				formaction="?/update"
				value="Update"
				on:click={preventSubmit}
			/>
			{#if hasSubstitutionTarget && substitutionSlug}
				<a href="/{slug}" class="btn btn-gray">View 💻</a>
				<a href="/{slug}" class="btn btn-gray">View 📱</a>
			{:else}
				<a href="/{slug}" class="btn btn-gray">View</a>
			{/if}

			<input
				type="submit"
				class="btn btn-red text-white ml-auto"
				formaction="?/delete"
				value="Delete"
				on:click={confirmDelete}
			/>
		{:else}
			<input
				type="submit"
				class="btn btn-blue text-white"
				value="Submit"
				on:click={preventSubmit}
			/>
		{/if}
	</div>
</form>
