<script lang="ts">
	import { enhance } from '$app/forms';
	import Picture from '$lib/components/Picture.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main class="flex flex-col items-center mt-6">
	<form method="post" action="?/update" use:enhance>
		<input type="text" name="name" class="form-input" value={data.picture.name} />
		<input type="submit" hidden />
	</form>
	<Picture picture={data.picture} class="mt-2 max-w-full" style="max-height: 500px" />
	<form method="post" action="?/delete" use:enhance>
		<input type="submit" value="Delete" class="mt-2" />
	</form>
</main>
