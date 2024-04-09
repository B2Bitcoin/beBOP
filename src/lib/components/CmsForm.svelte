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
		maintenanceDisplay: boolean;
		content: string;
	} | null;

	export let slug = cmsPage?._id || '';
	let pageContent = cmsPage?.content || '';
	let title = cmsPage?.title || '';
	let shortDescription = cmsPage?.shortDescription || '';
	let fullScreen = cmsPage?.fullScreen || false;
	let maintenanceDisplay = cmsPage?.maintenanceDisplay || false;
	let hideFromSEO = cmsPage?.hideFromSEO || false;

	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this CMS page?')) {
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
		Hide this from search engines
	</label>

	<label class="block w-full mt-4">
		Content

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
			<input type="submit" class="btn btn-blue text-white" formaction="?/update" value="Update" />
			<a href="/{slug}" class="btn btn-gray">View</a>

			<input
				type="submit"
				class="btn btn-red text-white ml-auto"
				formaction="?/delete"
				value="Delete"
				on:click={confirmDelete}
			/>
		{:else}
			<input type="submit" class="btn btn-blue text-white" value="Submit" />
		{/if}
	</div>
</form>
