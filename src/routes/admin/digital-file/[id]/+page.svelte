<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;
</script>

<form method="post" action="?/update" use:enhance class="flex flex-col gap-4">
	{#if data.digitalFile.productId}
		<a href="/admin/product/{data.digitalFile.productId}" class="underline text-blue text-center"
			>Back to product</a
		>
	{/if}

	<input type="text" name="name" class="form-input" value={data.digitalFile.name} />
	<a href={data.downloadLink} target="_blank" class="underline text-blue text-center"
		>Download file</a
	>
	<div class="flex gap-4 justify-between">
		<input type="submit" value="Update" class="btn btn-gray" />
		<input type="submit" value="Delete" formaction="?/delete" class="btn btn-red" />
	</div>
</form>
