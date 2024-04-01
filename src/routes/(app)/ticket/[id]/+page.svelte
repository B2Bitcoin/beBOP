<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';
	import ProductTypeTicket from '$lib/components/ProductType/ProductTypeTicket.svelte';
	import { useI18n } from '$lib/i18n.js';

	const { t } = useI18n();

	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6 flex flex-col gap-4">
	<h1 class="text-3xl flex gap-2 items-center">
		{#if data.picture}
			<Picture picture={data.picture} class="w-10 h-10 object-cover rounded" />
		{/if}
		{data.product.name}
	</h1>
	<ProductTypeTicket class="self-start" />
	<img src="/ticket/{data.ticket._id}/qrcode" alt="QR code" class="h-96 w-96" />

	<button class="self-start body-hyperlink">{t('ticket.print')}</button>

	{#if data.ticket.scanned}
		<p>{t('ticket.scanned')}</p>
	{/if}
</main>
