<script lang="ts">
	import TabLinksHeader from '$lib/components/TabLinksHeader.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<TabLinksHeader
	tabs={[
		{ href: `${data.adminPrefix}/gallery/${$page.params.id}`, name: 'Edit Gallery' },
		{ href: `${data.adminPrefix}/gallery/${$page.params.id}/translations`, name: 'Translations' }
	]}
/>

<slot />
