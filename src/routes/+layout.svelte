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
	import { PUBLIC_VERSION } from '$env/static/public';

	export let data;

	setContext('language', data.language);
</script>

<svelte:head>
	<title>{data.websiteTitle}</title>
	<meta name="viewport" content={data.viewportWidth} />
	{#if !$page.url.pathname.startsWith('/product') && !data.cmsPages.find((cmsPage) => cmsPage._id === $page.url.pathname.split('/')[1])}
		<meta name="description" content={data.websiteShortDescription} />
	{/if}
	<link rel="stylesheet" href="/style/variables.css?v={data.themeChangeNumber}" />
	{#if data.faviconPictureId}
		<link rel="icon" href="/favicon/{data.faviconPictureId}" />
	{:else}
		<link rel="icon" href="/favicon.png" />
	{/if}
	<script
		lang="javascript"
		src="/script/language/en.js?v={PUBLIC_VERSION}-{data.enUpdatedAt.getTime()}"
	></script>
	{#if data.language !== 'en'}
		<script
			lang="javascript"
			src="/script/language/{data.language}.js?v={PUBLIC_VERSION}-{data.languageUpdatedAt.getTime()}"
		></script>
	{/if}
	{#if data.plausibleScriptUrl}
		<script
			defer
			data-domain={$page.url.host}
			src={data.plausibleScriptUrl.replace(/\.js$/, 'exclusion.js')}
			data-exclude="/admin/*, /admin-*"
		>
		</script>
	{/if}
</svelte:head>

<slot class="body body-mainPlan" />
