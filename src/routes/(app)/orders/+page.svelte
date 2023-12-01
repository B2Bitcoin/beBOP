<script lang="ts">
	import OrdersList from '$lib/components/OrdersList.svelte';
	import { useI18n } from '$lib/i18n.js';

	export let data;

	const { t } = useI18n();
</script>

<main class="mx-auto max-w-7xl px-6 body-mainPlan flex flex-col gap-6">
	<h1 class="text-3xl">{t('order.list.title')}</h1>

	<OrdersList orders={data.orders} />
</main>
