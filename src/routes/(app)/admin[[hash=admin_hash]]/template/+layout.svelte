<script lang="ts">
	import TabLinksHeader from '$lib/components/TabLinksHeader.svelte';

	export let data;

	const tabs = [
		{ name: 'Emails', href: `${data.adminPrefix}/template/emails` },
		{ name: 'NostR', href: `${data.adminPrefix}/template/nostr` }
	];
</script>

<TabLinksHeader {tabs} />

<slot />
