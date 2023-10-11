<script>
	import '../app.css';
	import '@fontsource/outfit/700.css';
	import '@fontsource/outfit/600.css';
	import '@fontsource/outfit/500.css';
	import '@fontsource/outfit/400.css';
	import '@fontsource/outfit/300.css';
	import '@fontsource/poppins/400.css';
	import '@fontsource/gloock/400.css';

	import { PUBLIC_PLAUSIBLE_SCRIPT_URL } from '$env/static/public';
	import { page } from '$app/stores';
</script>

<svelte:head>
	{#if PUBLIC_PLAUSIBLE_SCRIPT_URL}
		<script defer data-domain={$page.url.host} src={PUBLIC_PLAUSIBLE_SCRIPT_URL}>
		</script>
	{/if}
</svelte:head>

<slot />
