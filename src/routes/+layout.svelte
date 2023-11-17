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
	import { setContext } from 'svelte';
	import { PUBLIC_COMMIT_ID } from '$env/static/public';

	export let data;

	setContext('language', data.language);
</script>

<svelte:head>
	<title>B2Bitcoin Bootik</title>
	<meta name="description" content="B2Bitcoin's official bootik" />
	<link rel="stylesheet" href="/style/variables.css?v={data.themeChangeNumber}" />
	<script lang="javascript" src="/script/language/en.js?v={PUBLIC_COMMIT_ID}"></script>
	{#if data.language !== 'en'}
		<script
			lang="javascript"
			src="/script/language/{data.language}.js?v={PUBLIC_COMMIT_ID}"
		></script>
	{/if}
	{#if data.plausibleScriptUrl}
		<script defer data-domain={$page.url.host} src={data.plausibleScriptUrl}>
		</script>
	{/if}
</svelte:head>

<slot />
