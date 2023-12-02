<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import OrderSummary from '$lib/components/OrderSummary.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { useI18n } from '$lib/i18n';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import { CUSTOMER_ROLE_ID, POS_ROLE_ID } from '$lib/types/User.js';
	import { toBitcoins } from '$lib/utils/toBitcoins';
	import { toSatoshis } from '$lib/utils/toSatoshis';
	import { differenceInMinutes } from 'date-fns';
	import { onMount } from 'svelte';

	let currentDate = new Date();
	export let data;

	let count = 0;

	onMount(() => {
		const interval = setInterval(() => {
			currentDate = new Date();

			if (data.order.payment.status === 'pending') {
				count++;
				if (count % 4 === 0) {
					invalidate(UrlDependency.Order);
				}
			}
		}, 1000);
		return () => clearInterval(interval);
	});

	const { t, locale } = useI18n();

	let receiptIFrame: HTMLIFrameElement | null = null;
	let receiptReady = false;
</script>

<main class="mx-auto max-w-7xl py-10 px-6 body-mainPlan">
	<div
		class="w-full rounded-xl body-mainPlan border-gray-300 p-6 grid flex md:grid-cols-3 sm:flex-wrap gap-2"
	>
		<div class="col-span-2 flex flex-col gap-2">
			<h1 class="text-3xl body-title">{t('order.singleTitle', { number: data.order.number })}</h1>
			{#if data.order.notifications?.paymentStatus?.npub}
				<p>
					{t('order.paymentStatusNpub')}:
					<span class="font-mono break-all break-words body-secondaryText">
						{data.order.notifications.paymentStatus.npub}</span
					>
				</p>
			{/if}
			{#if data.order.payment.status !== 'expired' && data.order.payment.status !== 'canceled'}
				<div>
					<Trans key="order.linkReminder"
						><a
							class="underline body-hyperlink break-all break-words body-secondaryText"
							href={$page.url.href}
							slot="0">{$page.url.href}</a
						></Trans
					>
				</div>
			{/if}

			{#if data.order.payment.status === 'pending'}
				{#if data.order.payment.method !== 'cash'}
					<ul>
						<li>
							{t('order.paymentAddress')}: {#if data.order.payment.method === 'card'}
								<a
									href="/order/{data.order._id}/pay"
									class="body-hyperlink underline break-all break-words"
									>{$page.url.origin}/{data.order._id}/pay</a
								>
							{:else}
								<code class="break-words body-secondaryText break-all"
									>{data.order.payment.address}</code
								>
							{/if}
						</li>
						<li>
							{t('order.paymentAmount')}:
							<code class="break-words body-secondaryText">
								{(data.order.payment.method === 'bitcoin'
									? toBitcoins(data.order.totalPrice.amount, data.order.totalPrice.currency)
									: toSatoshis(data.order.totalPrice.amount, data.order.totalPrice.currency)
								).toLocaleString('en-US', { maximumFractionDigits: 8 })}
								{data.order.payment.method === 'bitcoin' ? 'BTC' : 'sats'}
							</code>
						</li>
						<li>
							{t('order.timeRemaining', {
								minutes: differenceInMinutes(data.order.payment.expiresAt, currentDate)
							})}
						</li>
					</ul>
					<img src="{$page.url.pathname}/qrcode" class="w-96 h-96" alt="QR code" />
					<div class="text-xl">
						{t('order.payToComplete')}
						{#if data.order.payment.method === 'bitcoin'}
							{t('order.payToCompleteBitcoin', { count: data.confirmationBlocksRequired })}
						{/if}
					</div>
				{/if}
			{:else if data.order.payment.status === 'paid'}
				<p>
					<Trans key="order.paymentStatus.paidTemplate"
						><span class="text-green-500" let:translation slot="0">{translation}</span></Trans
					>
				</p>
			{:else if data.order.payment.status === 'expired'}
				<p>{t('order.paymentStatus.expiredTemplate')}</p>
			{:else if data.order.payment.status === 'canceled'}
				<p class="font-bold">{t('order.paymentStatus.canceledTemplate')}</p>
			{/if}

			{#if data.digitalFiles.length}
				<h2 class="text-2xl">{t('product.digitalFiles.title')}</h2>
				<ul>
					{#each data.digitalFiles as digitalFile}
						<li>
							{#if digitalFile.link}
								<a href={digitalFile.link} class="body-hyperlink hover:underline" target="_blank"
									>{digitalFile.name}</a
								>
							{:else}
								{digitalFile.name}
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			{#if data.order.vatFree}
				<p>{t('order.vatFree', { reason: data.order.vatFree.reason })}</p>
			{/if}
			<p class="text-base">
				<Trans key="order.createdAt"
					><time
						datetime={data.order.createdAt.toJSON()}
						title={data.order.createdAt.toLocaleString($locale)}
						slot="0">{data.order.createdAt.toLocaleString($locale)}</time
					></Trans
				>
			</p>

			{#if data.order.shippingAddress}
				<div>
					{t('order.shippingAddress.title')}:
					<pre class="break-words body-secondaryText">{JSON.stringify(
							data.order.shippingAddress,
							null,
							2
						)}</pre>
				</div>
			{/if}
			{#if data.order.payment.status === 'pending' && data.order.payment.method === 'cash' && data.roleId !== CUSTOMER_ROLE_ID && data.roleId}
				<form
					action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order._id}?/confirm"
					method="post"
				>
					<button type="submit" class="btn btn-black">{t('pos.cta.markOrderPaid')}</button>
				</form>
				<form
					action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order._id}?/cancel"
					method="post"
				>
					<button type="submit" class="btn btn-red">{t('pos.cta.cancelOrder')}</button>
				</form>
			{/if}
			{#if data.order.payment.status === 'pending' && 0}
				<form method="post" action="?/cancel">
					<button type="submit" class="btn btn-red">Cancel</button>
				</form>
			{/if}
			{#if data.order.payment.status === 'paid'}
				<button
					class="btn btn-black self-start"
					type="button"
					disabled={!receiptReady}
					on:click={() => receiptIFrame?.contentWindow?.print()}>{t('order.receipt.create')}</button
				>
				<iframe
					src="/order/{data.order._id}/receipt"
					style="width: 1px; height: 1px; position: absolute; left: -1000px; top: -1000px;"
					title=""
					on:load={() => (receiptReady = true)}
					bind:this={receiptIFrame}
				/>
			{/if}
		</div>
		<div class="">
			<OrderSummary class="sticky top-4 -mr-2 -mt-2" order={data.order} />
		</div>
	</div>
</main>
