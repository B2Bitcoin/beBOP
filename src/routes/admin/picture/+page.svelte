<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main class="p-4">
	<h1 class="text-3xl">List of pictures with no associated product</h1>

	<a href="/admin/picture/new" class="my-4 block underline">New picture</a>

	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each data.pictures as picture}
			<div class="flex flex-col text-center">
				<a href="/admin/picture/{picture._id}" class="flex flex-col items-center">
					<Picture {picture} class="h-36 block" style="object-fit: scale-down;" />
					<span>{picture.name}</span>
				</a>
			</div>
		{/each}
	</div>
</main>
