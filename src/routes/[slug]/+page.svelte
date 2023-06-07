<script lang="ts">
	import { marked } from 'marked';

	export let data;
</script>

<svelte:head>
	<title>{data.cmsPage.title}</title>
	<meta name="description" content={data.cmsPage.shortDescription} />
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border p-6">
		<div class="prose">
			{@html marked(data.cmsPage.content)}
		</div>
	</article>
</main>
