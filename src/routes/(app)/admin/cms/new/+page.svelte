<script lang="ts">
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
	import Editor from '@tinymce/tinymce-svelte';

	let pageContent = '';
</script>

<h1 class="text-3xl">Add a CMS Page</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4">
	<label>
		Page slug
		<input
			class="form-input block"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="slug"
			placeholder="Page slug"
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
		/>
	</label>

	<label class="checkbox-label">
		<input type="checkbox" name="fullScreen" class="form-checkbox" />
		Full screen
	</label>
	<label class="checkbox-label">
		<input type="checkbox" name="maintenanceDisplay" class="form-checkbox" />
		Available even in Maintenance mode
	</label>
	<label class="block w-full mt-4">
		Content

		<Editor scriptSrc="/tinymce/tinymce.min.js" bind:value={pageContent} />

		<p class="text-gray-700 my-3">
			To include products, add a paragraph with only <code class="font-mono">[Product=slug]</code>,
			where
			<code class="font-mono">slug</code> is the slug of your product
		</p>

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

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
