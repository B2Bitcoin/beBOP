<script lang="ts">
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
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

	<label class="block w-full mt-4">
		Content
		<textarea
			name="content"
			cols="30"
			rows="10"
			maxlength="10000"
			placeholder="Markdown content"
			class="form-input block w-full"
		/>
	</label>

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
