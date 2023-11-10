<script>
	import PriceTag from '$lib/components/PriceTag.svelte';
	import IconBitcoin from '$lib/components/icons/IconBitcoin.svelte';
	import { useI18n } from '$lib/i18n.js';
	import { toSatoshis } from '$lib/utils/toSatoshis';
	import { formatDistance } from 'date-fns';

	const { t } = useI18n();

	export let data;
</script>

<main class="max-w-7xl p-4 flex flex-col gap-4">
	<a href="/pos/session" class="text-link hover:underline">{t('pos.sessionLink')}</a>

	<form action="/admin/logout" method="POST">
		<button type="submit" class="btn btn-red">{t('login.cta.logout')}</button>
	</form>

	<h2 class="text-2xl">{t('pos.lastOrders.title')}</h2>

	<ul class="flex flex-col gap-4">
		{#each data.orders as order}
			<li class="text-lg flex flex-wrap items-center gap-1">
				<a href="/order/{order._id}" class="text-link hover:underline">#{order.number}</a>
				- {#if order.payment.method === 'bitcoin'}
					<IconBitcoin />
				{:else if order.payment.method === 'lightning'}
					⚡
				{:else if order.payment.method === 'cash'}
					💶
				{/if} -
				<time datetime={order.createdAt.toJSON()} title={order.createdAt.toLocaleString('en')}
					>{formatDistance(order.createdAt, Date.now(), {
						addSuffix: true
					})}</time
				>
				- {t('cart.total')}: {toSatoshis(
					order.totalPrice.amount,
					order.totalPrice.currency
				).toLocaleString('en')}
				SAT {#if data.currencies.priceReference !== 'SAT'}(<PriceTag
						currency={order.totalPrice.currency}
						amount={order.totalPrice.amount}
						convertedTo={data.currencies.priceReference}
					/>){/if}-
				<span
					class={order.payment.status === 'expired' || order.payment.status === 'canceled'
						? 'text-gray-550'
						: order.payment.status === 'paid'
						? 'text-green-500'
						: ''}
				>
					{order.payment.status}</span
				>
				- {t('pos.order.satReceived')}: {(order.payment.totalReceived ?? 0).toLocaleString('en')}
				SAT

				{#if order.payment.status === 'pending' && order.payment.method === 'cash'}
					<form action="/pos/order/{order._id}?/confirm" method="post">
						<button type="submit" class="btn btn-black">{t('pos.cta.markOrderPaid')}</button>
					</form>
					<form action="/pos/order/{order._id}?/cancel" method="post">
						<button type="submit" class="btn btn-red">{t('pos.cta.cancelOrder')}</button>
					</form>
				{/if}
			</li>
		{:else}
			<li>No orders yet</li>
		{/each}
	</ul>
</main>
