<script lang="ts">
	import ThemeForm from '$lib/components/ThemeForm.svelte';

	export let data;
</script>

<h1 class="text-3xl">Edit theme</h1>

<form method="post" class="flex flex-col gap-4">
	<ThemeForm theme={data.theme} />

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
