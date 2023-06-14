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
	<div class="flex gap-4">
		<input type="submit" value="Update" class="btn btn-black" />
		{#if !data.picture.productId}
			{#if data.logo === data.picture._id}
				<input
					type="submit"
					value="Remove from logo"
					formaction="?/removeLogo"
					class="btn btn-gray"
				/>
			{:else}
				<input type="submit" value="Set as logo" formaction="?/setAsLogo" class="btn btn-gray" />
			{/if}
		{/if}
		<input type="submit" value="Delete" formaction="?/delete" class="btn btn-red ml-auto" />
	</div>
</form>
