<script>
	import '../app.css';
	import '@fontsource/outfit/700.css';
	import '@fontsource/outfit/600.css';
	import '@fontsource/outfit/500.css';
	import '@fontsource/outfit/400.css';
	import '@fontsource/outfit/300.css';
	import '@fontsource/poppins/400.css';
	import '@fontsource/gloock/400.css';
	import { page } from '$app/stores';

	export let data;
</script>

<svelte:head>
	{#if data.plausibleScriptUrl}
		<script defer data-domain={$page.url.host} src={data.plausibleScriptUrl}>
		</script>
	{/if}
</svelte:head>

<slot />
