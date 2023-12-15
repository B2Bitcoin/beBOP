<script lang="ts">
	import TabLinksHeader from '$lib/components/TabLinksHeader.svelte';

	export let data;
</script>

<TabLinksHeader
	tabs={[
		{ href: `${data.adminPrefix}/layout`, name: 'Edit Layout' },
		{
			href: `${data.adminPrefix}/layout/translations`,
			name: 'Translations'
		}
	]}
/>

<slot />
