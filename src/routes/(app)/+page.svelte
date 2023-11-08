<script lang="ts">
	import Catalog from '$lib/components/Catalog.svelte';
	import CmsPage from '$lib/components/CmsPage.svelte';

	export let data;
</script>

{#if data.cms}
	<CmsPage {...data} {...data.cms} />
{:else}
	<Catalog {...data.catalog} />
{/if}
