<script lang="ts">
	import type { SimplifiedOrder } from '$lib/types/Order';
	import PriceTag from './PriceTag.svelte';
	import IconBitcoin from './icons/IconBitcoin.svelte';
	import { currencies } from '$lib/stores/currencies';
	import { useI18n } from '$lib/i18n';

	export let orders:
		| Pick<
				SimplifiedOrder,
				'_id' | 'payments' | 'number' | 'createdAt' | 'currencySnapshot' | 'status'
		  >[]
		| [];
	export let adminPrefix: string | undefined = undefined;

	const { t, locale } = useI18n();
</script>

<ul class="flex flex-col gap-4">
	{#each orders as order}
		<li class="text-lg flex flex-wrap items-center gap-1">
			<a href="/order/{order._id}" class="text-link hover:underline">
				#{order.number.toLocaleString($locale)}
			</a>
			- {#if order.payments[0].method === 'bitcoin'}
				<IconBitcoin />
			{:else if order.payments[0].method === 'lightning'}
				⚡
			{:else if order.payments[0].method === 'cash'}
				💶
			{:else if order.payments[0].method === 'card'}
				💳
			{/if} -
			<time datetime={order.createdAt.toJSON()} title={order.createdAt.toLocaleString($locale)}
				>{order.createdAt.toLocaleDateString($locale)}</time
			>
			- <PriceTag
				currency={order.currencySnapshot.main.totalPrice.currency}
				amount={order.currencySnapshot.main.totalPrice.amount}
			/>
			{#if adminPrefix}(<PriceTag
					currency={order.currencySnapshot.priceReference.totalPrice.currency}
					amount={order.currencySnapshot.priceReference.totalPrice.amount}
					convertedTo={$currencies.priceReference}
				/>){/if} -
			<span
				class={order.status === 'expired' || order.status === 'canceled'
					? 'text-gray-550'
					: order.status === 'paid'
					? 'text-green-500'
					: ''}
			>
				{t('order.paymentStatus.' + order.status)}</span
			>
			{#if order.currencySnapshot.main.totalReceived && adminPrefix}
				- {t('pos.order.satReceived')}
				<PriceTag
					inline
					currency={order.currencySnapshot.main.totalReceived.currency}
					amount={order.currencySnapshot.main.totalReceived.amount}
				/>
			{/if}
			{#if adminPrefix}
				{#each order.payments as payment}
					{#if payment.status === 'pending' && payment.method === 'cash'}
						<form
							action="{adminPrefix}/order/{order._id}/payment/{payment.id}?/confirm"
							method="post"
						>
							<button type="submit" class="btn btn-black">Mark paid</button>
						</form>
						<form
							action="{adminPrefix}/order/{order._id}/payment/{payment.id}?/cancel"
							method="post"
						>
							<button type="submit" class="btn btn-red">Cancel</button>
						</form>
					{/if}
				{/each}
			{/if}
		</li>
	{:else}
		<li>No orders yet</li>
	{/each}
</ul>
