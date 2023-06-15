<script lang="ts">
	import Catalog from '$lib/components/Catalog.svelte';
	import CmsPage from '$lib/components/CmsPage.svelte';

	export let data;
</script>

{#if data.cmsPage}
	<CmsPage {...data} />
{:else}
	<Catalog {...data} />
{/if}
