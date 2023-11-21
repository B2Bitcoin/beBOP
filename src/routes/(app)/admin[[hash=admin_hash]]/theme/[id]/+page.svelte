<script lang="ts">
	import ThemeForm from '$lib/components/ThemeForm.svelte';
	import PictureComponent from '$lib/components/Picture.svelte';

	export let data;
</script>

<h1 class="text-3xl">Edit theme</h1>

<form method="post" class="flex flex-col gap-4">
	<h2 class="text-2xl my-4">logos</h2>

	<div class="flex flex-row flex-wrap gap-6">
		{#each data.pictures as picture}
			<div class="flex flex-col text-center">
				<a href="/admin/picture/{picture._id}" class="flex flex-col items-center">
					<PictureComponent {picture} class="h-20 block" style="object-fit: scale-down;" />
					<span>{picture._id} (<b>{picture.theme?.type}</b>)</span>
				</a>
			</div>
		{/each}
	</div>
	<a href="/admin/picture/new?themeId={data.theme._id}" class="underline">Add picture</a>
	<ThemeForm theme={data.theme} />

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
