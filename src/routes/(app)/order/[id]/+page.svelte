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
	import { trimOrigin } from '$lib/utils/trimOrigin';
	import { differenceInMinutes } from 'date-fns';
	import { onMount } from 'svelte';

	let currentDate = new Date();
	export let data;

	let count = 0;

	onMount(() => {
		const interval = setInterval(() => {
			currentDate = new Date();

			if (data.order.status === 'pending') {
				count++;
				if (count % 4 === 0) {
					invalidate(UrlDependency.Order);
				}
			}
		}, 1000);
		return () => clearInterval(interval);
	});

	const { t, locale, textAddress } = useI18n();

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
			{#if data.order.status !== 'expired' && data.order.status !== 'canceled'}
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

			{#each data.order.payments.filter((p) => p.status === 'pending') as payment}
				{#if payment.method !== 'cash'}
					<ul>
						<li>
							{t('order.paymentAddress')}: {#if payment.method === 'card'}
								<a
									href={trimOrigin(payment.address ?? '')}
									class="body-hyperlink underline break-all break-words"
								>
									{$page.url.origin}{trimOrigin(payment.address ?? '')}
								</a>
							{:else if payment.method === 'bankTransfer'}
								<code class="break-words body-secondaryText break-all"
									>{data.sellerIdentity?.bank?.iban}</code
								>
							{:else}
								<code class="break-words body-secondaryText break-all">{payment.address}</code>
							{/if}
						</li>
						<li>
							{t('order.paymentAmount')}:
							<code class="break-words body-secondaryText">
								{(payment.method === 'bitcoin'
									? toBitcoins(payment.price.amount, payment.price.currency)
									: toSatoshis(payment.price.amount, payment.price.currency)
								).toLocaleString('en-US', { maximumFractionDigits: 8 })}
								{payment.method === 'bitcoin' ? 'BTC' : 'sats'}
							</code>
						</li>
						{#if payment.expiresAt && payment.method !== 'bankTransfer'}
							<li>
								{t('order.timeRemaining', {
									minutes: differenceInMinutes(payment.expiresAt, currentDate)
								})}
							</li>
						{/if}
					</ul>
					{#if payment.method === 'bitcoin'}
						<img
							src="{$page.url.pathname}/payment/{payment.id}/qrcode"
							class="w-96 h-96"
							alt="QR code"
						/>
					{/if}
					<div class="text-xl">
						{t('order.payToComplete')}
						{#if payment.method === 'bitcoin'}
							{t('order.payToCompleteBitcoin', { count: payment.confirmationBlocksRequired })}
						{/if}
					</div>
				{/if}
				{#if payment.method === 'cash' && data.roleId !== CUSTOMER_ROLE_ID && data.roleId}
					<form
						action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order
							._id}/payment/{payment.id}?/confirm"
						method="post"
					>
						<button type="submit" class="btn btn-black">{t('pos.cta.markOrderPaid')}</button>
					</form>
					<form
						action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order
							._id}/{payment.id}?/cancel"
						method="post"
					>
						<button type="submit" class="btn btn-red">{t('pos.cta.cancelOrder')}</button>
					</form>
				{/if}
				{#if payment.method === 'bankTransfer'}
					{#if data.sellerIdentity?.contact.email}
						<a href="mailto:{data.sellerIdentity.contact.email}" class="btn btn-black">
							{t('order.informSeller')}
						</a>
					{/if}
				{/if}
			{/each}

			{#if data.order.status === 'paid'}
				<p>
					<Trans key="order.paymentStatus.paidTemplate"
						><span class="text-green-500" let:translation slot="0">{translation}</span></Trans
					>
				</p>
			{:else if data.order.status === 'expired'}
				<p>{t('order.paymentStatus.expiredTemplate')}</p>
			{:else if data.order.status === 'canceled'}
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
					<p class="body-secondaryText whitespace-pre-wrap">
						{textAddress(data.order.shippingAddress)}
					</p>
				</div>
			{/if}

			{#if data.order.payments[0].status === 'paid'}
				<button
					class="btn btn-black self-start"
					type="button"
					disabled={!receiptReady}
					on:click={() => receiptIFrame?.contentWindow?.print()}>{t('order.receipt.create')}</button
				>
				<iframe
					src="/order/{data.order._id}/payment/{data.order.payments[0].id}/receipt"
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
