<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';
	import { downloadFile } from '$lib/utils/downloadFile.js';

	export let data;
</script>

<h1 class="text-3xl">Style</h1>
<a href="/admin/style/new">Create a new theme</a>
{#each data.styles as style}
	<a href={`/admin/style/${style._id}`}>{style.name}</a>
{/each}
