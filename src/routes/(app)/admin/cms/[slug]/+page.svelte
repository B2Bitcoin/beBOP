<script lang="ts">
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';

	export let data;

	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this CMS page?')) {
			event.preventDefault();
		}
	}
</script>

<h1 class="text-3xl">Edit a CMS Page</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4">
	<label>
		Page slug
		<input
			class="form-input block"
			type="text"
			placeholder="Page slug"
			value={data.cmsPage._id}
			disabled
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
			value={data.cmsPage.title}
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
			value={data.cmsPage.shortDescription}
		/>
	</label>

	<label class="checkbox-label">
		<input
			type="checkbox"
			name="fullScreen"
			checked={data.cmsPage.fullScreen}
			class="form-checkbox"
		/>
		Full screen
	</label>

	<label class="checkbox-label">
		<input
			type="checkbox"
			name="maintenanceDisplay"
			checked={data.cmsPage.maintenanceDisplay}
			class="form-checkbox"
		/>
		Available even in Maintenance mode
	</label>

	<label class="block w-full mt-4">
		Content
		<textarea
			name="content"
			cols="30"
			rows="10"
			maxlength={MAX_CONTENT_LIMIT}
			placeholder="Markdown content"
			class="form-input block w-full"
			value={data.cmsPage.content}
		/>
		<p class="text-gray-700">
			To include products, add a paragraph with only <code class="font-mono">[Product=slug]</code>,
			where
			<code class="font-mono">slug</code> is the slug of your product
		</p>
	</label>

	<div class="flex flex-row justify-between gap-2">
		<input type="submit" class="btn btn-blue text-white" formaction="?/update" value="Update" />
		<a href="/{data.cmsPage._id}" class="btn btn-gray">View</a>

		<input
			type="submit"
			class="btn btn-red text-white ml-auto"
			formaction="?/delete"
			value="Delete"
			on:click={confirmDelete}
		/>
	</div>
</form>
