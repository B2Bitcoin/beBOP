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
	<p>
		{t('ticket.boughtAt', {
			date: new Date(data.ticket.createdAt).toLocaleDateString(),
			time: new Date(data.ticket.createdAt).toLocaleTimeString()
		})}
	</p>

	{#if data.canBurn && !data.ticket.scanned}
		<form action="/admin/ticket/{data.ticket.ticketId}/burn" method="POST">
			<button class="btn btn-green self-start">{t('ticket.burn')}</button>
		</form>
	{/if}
	{#if data.canUnburn && data.ticket.scanned}
		<form action="/admin/ticket/{data.ticket.ticketId}/unburn" method="POST">
			<button class="btn btn-red self-start">{t('ticket.unburn')}</button>
		</form>
	{/if}

	{#if data.ticket.scanned}
		<p>
			{t('ticket.scanned', {
				date: new Date(data.ticket.scanned.at).toLocaleDateString(),
				time: new Date(data.ticket.scanned.at).toLocaleTimeString()
			})}
		</p>
	{:else}
		<button class="print:hidden self-start body-hyperlink" on:click={() => window.print()}>
			{t('ticket.print')}
		</button>
	{/if}
	<img src="/ticket/{data.ticket.ticketId}/qrcode" alt="QR code" class="h-96 w-96" />
</main>
