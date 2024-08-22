<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';

	export let data;
</script>

<h1 class="text-3xl">List of product pictures</h1>

<div class="flex flex-row flex-wrap gap-6">
	{#each data.pictures as picture}
		<div class="flex flex-col text-center">
			<a
				href="{data.adminPrefix}/file/{picture._id}"
				class="flex flex-col items-center body-hyperlink hover:underline"
			>
				<span>{picture.name}</span>
			</a>
		</div>
	{/each}
</div>
