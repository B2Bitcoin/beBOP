<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';

	export let data;
</script>

<h1 class="text-3xl">List of pictures with no associated product</h1>

<a href="{data.adminPrefix}/picture/new" class="block underline">New picture</a>

<div class="flex flex-row flex-wrap gap-6">
	{#each data.pictures as picture}
		<div class="flex flex-col text-center">
			<a href="{data.adminPrefix}/picture/{picture._id}" class="flex flex-col items-center">
				<Picture {picture} class="block h-36" />
				<span>{picture.name}</span>
			</a>
		</div>
	{/each}
</div>
