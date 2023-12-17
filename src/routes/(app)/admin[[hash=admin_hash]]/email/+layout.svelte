<script lang="ts">
	import TabLinksHeader from '$lib/components/TabLinksHeader.svelte';

	export let data;

	const tabs = [
		{ name: 'Emails', href: `${data.adminPrefix}/email` },
		{ name: 'Templates', href: `${data.adminPrefix}/email/templates` }
		// { name: 'Translations', href: `${data.adminPrefix}/email/translations` }
	];
</script>

<TabLinksHeader {tabs} />

<slot />
