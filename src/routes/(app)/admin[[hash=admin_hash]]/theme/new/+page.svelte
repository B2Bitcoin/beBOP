<script lang="ts">
	import ThemeForm from '$lib/components/ThemeForm.svelte';
</script>

<h1 class="text-3xl">Create a new theme</h1>

<form method="post" class="flex flex-col gap-4">
	<ThemeForm />

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
