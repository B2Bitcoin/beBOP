<script lang="ts">
	import TabLinksHeader from '$lib/components/TabLinksHeader.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<TabLinksHeader
	tabs={[
		{ href: `${data.adminPrefix}/tags/${$page.params.id}`, name: 'Edit Tag' },
		{ href: `${data.adminPrefix}/tags/${$page.params.id}/translations`, name: 'Translations' }
	]}
/>

<slot />
