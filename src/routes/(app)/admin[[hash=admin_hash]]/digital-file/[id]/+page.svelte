<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;
</script>

<form method="post" action="?/update" use:enhance class="flex flex-col gap-4">
	{#if data.digitalFile.productId}
		<a
			href="{data.adminPrefix}/product/{data.digitalFile.productId}"
			class="underline body-hyperlink text-center"
		>
			Back to product
		</a>
	{:else}
		<a href="{data.adminPrefix}/digital-file" class="underline body-hyperlink text-center">
			Back to files
		</a>
	{/if}

	<input type="text" name="name" class="form-input" value={data.digitalFile.name} />
	<a href={data.downloadLink} target="_blank" class="underline body-hyperlink text-center"
		>Download file</a
	>
	<div class="flex gap-4 justify-between">
		<input type="submit" value="Update" class="btn btn-gray" />
		<input type="submit" value="Delete" formaction="?/delete" class="btn btn-red" />
	</div>
</form>
