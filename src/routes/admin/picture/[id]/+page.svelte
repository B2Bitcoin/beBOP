<script lang="ts">
	import { enhance } from '$app/forms';
	import Picture from '$lib/components/Picture.svelte';

	export let data;
</script>

<form method="post" action="?/update" use:enhance class="flex flex-col gap-4">
	{#if data.picture.productId}
		<a href="/admin/product/{data.picture.productId}" class="underline text-blue text-center"
			>Back to product</a
		>
	{:else}
		<a href="/admin/picture" class="underline text-blue text-center">Back to list</a>
	{/if}

	<input type="text" name="name" class="form-input" value={data.picture.name} />
	<Picture picture={data.picture} class="object-contain max-h-[500px] max-w-full" />
	<div class="flex gap-4 justify-between">
		<input type="submit" value="Update" class="btn btn-gray" />
		<input type="submit" value="Delete" formaction="?/delete" class="btn btn-red" />
	</div>
</form>
