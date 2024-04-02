<script>
	import OrdersList from '$lib/components/OrdersList.svelte';
	import { useI18n } from '$lib/i18n';

	const { t } = useI18n();

	export let data;
</script>

<main class="max-w-7xl p-4 flex flex-col gap-4">
	<a href="/pos/session" class="body-hyperlink hover:underline">{t('pos.sessionLink')}</a>
	<a href="/admin" class="body-hyperlink hover:underline" target="_blank"
		>{t('pos.adminInterface')}</a
	>

	<form action="/admin/logout" method="POST">
		<button type="submit" class="btn btn-red">{t('login.cta.logout')}</button>
	</form>

	<h2 class="text-2xl">{t('pos.lastOrders.title')}</h2>

	<OrdersList orders={data.orders} adminPrefix="/pos" />
</main>
