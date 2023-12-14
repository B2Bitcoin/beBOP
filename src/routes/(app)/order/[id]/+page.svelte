<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import OrderSummary from '$lib/components/OrderSummary.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { useI18n } from '$lib/i18n';
	import { orderAmountWithNoPaymentsCreated } from '$lib/types/Order';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import { CUSTOMER_ROLE_ID, POS_ROLE_ID } from '$lib/types/User.js';
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

	let receiptIFrame: Record<string, HTMLIFrameElement | null> = Object.fromEntries(
		data.order.payments.map((payment) => [payment.id, null])
	);
	let receiptReady: Record<string, boolean> = Object.fromEntries(
		data.order.payments.map((payment) => [payment.id, false])
	);

	$: remainingAmount = orderAmountWithNoPaymentsCreated(data.order);
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

			{#each data.order.payments as payment}
				<details class="border border-gray-300 rounded-xl p-4" open={payment.status === 'pending'}>
					<summary class="text-xl cursor-pointer">
						<!-- Extra span to keep the "arrow" for the details -->
						<span class="items-center inline-flex gap-2"
							>{t(`checkout.paymentMethod.${payment.method}`)} - <PriceTag
								inline
								class="break-words {payment.status === 'paid'
									? 'text-green-500'
									: 'body-secondaryText'} "
								amount={payment.price.amount}
								currency={payment.price.currency}
							/> - {t(`order.paymentStatus.${payment.status}`)}</span
						>
					</summary>
					<div class="flex flex-col gap-2 mt-2">
						{#if payment.method !== 'point-of-sale'}
							<ul>
								{#if payment.status !== 'paid'}
									<li>
										{#if payment.method === 'card'}
											<a href={trimOrigin(payment.address ?? '')} aria-label="SumUp Logo" class="eh1v18z32 css-46yzjd">
												<li>{t('order.paymentLink')}</li>
												<svg class="h-[75px] " viewBox="0 0 214 63" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g fill-rule="evenodd" class="logo-symbol"><path d="M58.2.5H5.1C2.7.5.7 2.5.7 4.9v52.8c0 2.4 2 4.4 4.4 4.4h53.1c2.4 0 4.4-2 4.4-4.4V4.9c0-2.5-2-4.4-4.4-4.4zM39.5 46.8c-5.4 5.4-14 5.6-19.7.7l-.1-.1c-.3-.3-.4-.9 0-1.3L38.9 27c.4-.3.9-.3 1.3 0 5 5.8 4.8 14.4-.7 19.8zm4-30.5L24.3 35.4c-.4.3-.9.3-1.3 0-5-5.7-4.8-14.3.6-19.7 5.4-5.4 14-5.6 19.7-.7 0 0 .1 0 .1.1.5.3.5.9.1 1.2z" fill-rule="nonzero"></path></g><g fill-rule="evenodd" class="logo-text"><path d="M144.5 17.6h-.1c-2.4 0-4.5 1-6 2.5-1.5-1.5-3.7-2.5-6-2.5h-.1c-4.6 0-8.4 3.7-8.4 8.4v16.3c.1 1.3 1.1 2.3 2.4 2.3 1.3 0 2.3-1 2.4-2.3V26c0-2 1.6-3.6 3.6-3.6h.1c2 0 3.5 1.5 3.6 3.5v16.4c.121 1.182.953 2.3 2.3 2.3 1.3 0 2.3-1 2.4-2.3V25.8c.1-1.9 1.7-3.5 3.6-3.5h.1c2 0 3.6 1.6 3.6 3.6v16.4c.1 1.3 1.1 2.3 2.4 2.3 1.3 0 2.3-1 2.4-2.3V26c.1-4.6-3.7-8.4-8.3-8.4zm-28.4 0c-1.3 0-2.3 1-2.4 2.3v16.3c0 2-1.6 3.6-3.7 3.6h-.1c-2 0-3.7-1.6-3.7-3.6V19.8c-.1-1.3-1.1-2.3-2.4-2.3-1.3 0-2.3 1-2.4 2.3v16.3c0 4.6 3.8 8.4 8.5 8.4h.1c4.7 0 8.5-3.8 8.5-8.4V19.9c0-1.3-1.1-2.3-2.4-2.3zm56.8 0c-1.3 0-2.3 1-2.4 2.3v16.3c0 2-1.6 3.6-3.7 3.6h-.1c-2 0-3.7-1.6-3.7-3.6V19.8c-.1-1.3-1.1-2.3-2.4-2.3-1.3 0-2.3 1-2.4 2.3v16.3c0 4.6 3.8 8.4 8.5 8.4h.1c4.7 0 8.5-3.8 8.5-8.4V19.9c-.1-1.3-1.1-2.3-2.4-2.3z"></path><path d="M188.8 17.6h-.1c-4.8 0-8.6 3.8-8.6 8.5v29.6c0 1.3 1.1 2.4 2.4 2.4 1.3 0 2.4-1.1 2.4-2.4V43.4c.9.8 2.4 1.2 3.8 1.2h.1c4.8 0 8.4-4.1 8.4-8.8v-9.9c0-4.7-3.6-8.3-8.4-8.3zm3.8 18.4c0 2.6-1.7 3.7-3.7 3.7h-.1c-2.1 0-3.7-1.1-3.7-3.7v-9.9c0-2 1.7-3.7 3.7-3.7h.1c2.1 0 3.7 1.6 3.7 3.7V36z" fill-rule="nonzero"></path><path d="M89.6 28.3c-2.7-1.1-4.4-1.8-4.4-3.4 0-1.3 1-2.5 3.3-2.5 1.4 0 2.6.6 3.5 1.8.6.7 1.2 1.1 1.9 1.1 1.4 0 2.5-1.1 2.5-2.4 0-.5-.1-1-.4-1.3-1.5-2.3-4.6-3.9-7.5-3.9-4 0-8.1 2.5-8.1 7.3 0 4.9 4 6.5 7.3 7.7 2.6 1 4.9 1.9 4.9 4 0 1.6-1.5 3.2-4.3 3.2-.9 0-2.5-.2-3.6-1.5-.6-.7-1.3-1-1.9-1-1.3 0-2.5 1.1-2.5 2.4 0 .5.2 1 .5 1.4 1.5 2.3 4.9 3.4 7.5 3.4 4.4 0 9.2-2.8 9.2-7.9-.1-5.4-4.4-7.1-7.9-8.4z"></path><g fill-rule="nonzero"><path d="M208.4 17.6c-2.6 0-4.8 2.1-4.8 4.8 0 2.6 2.1 4.8 4.8 4.8 2.6 0 4.8-2.1 4.8-4.8 0-2.6-2.1-4.8-4.8-4.8zm0 8.4c-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6 3.6 1.6 3.6 3.6-1.6 3.6-3.6 3.6z"></path><path d="M208.9 22.6c.6-.1 1-.6 1-1.2 0-.8-.6-1.3-1.5-1.3h-1.2c-.3 0-.5.2-.5.5v3.3c0 .3.2.5.5.5s.5-.2.5-.5v-1.2l1.2 1.5c.1.2.2.2.5.2.4 0 .5-.3.5-.5s-.1-.3-.2-.4l-.8-.9zm-.4-.7h-.6v-1h.6c.3 0 .5.2.5.5 0 .2-.2.5-.5.5z"></path></g></g></svg>
											</a>

										{:else if payment.method === 'bankTransfer'}
											{t('order.paymentIban')}:
											<code class="break-words body-secondaryText break-all"
												>{data.sellerIdentity?.bank?.iban.replace(/.{4}(?=.)/g, '$& ')}</code
											>
										{:else}
											{t('order.paymentAddress')}:
											<code class="break-words body-secondaryText break-all">{payment.address}</code
											>
										{/if}
									</li>
								{/if}
								{#if payment.expiresAt && payment.status === 'pending'}
									<li>
										{t('order.timeRemaining', {
											minutes: differenceInMinutes(payment.expiresAt, currentDate)
										})}
									</li>
								{/if}
								{#if payment.status === 'paid' && payment.paidAt}
									<li>
										{t('order.paymentPaidAt', {
											date: payment.paidAt.toLocaleDateString($locale)
										})}
									</li>
								{/if}
							</ul>

							{#if payment.status === 'paid' && payment.invoice?.number}
								<button
									class="btn btn-black self-start"
									type="button"
									disabled={!receiptReady[payment.id]}
									on:click={() => receiptIFrame[payment.id]?.contentWindow?.print()}
									>{t('order.receipt.create')}</button
								>
								<iframe
									src="/order/{data.order._id}/payment/{payment.id}/receipt"
									style="width: 1px; height: 1px; position: absolute; left: -1000px; top: -1000px;"
									title=""
									on:load={() => (receiptReady = { ...receiptReady, [payment.id]: true })}
									bind:this={receiptIFrame[payment.id]}
								/>
							{/if}
							{#if payment.status === 'pending' && (payment.method === 'bitcoin' || payment.method === 'lightning' || payment.method === 'card')}
								<img
									src="{$page.url.pathname}/payment/{payment.id}/qrcode"
									class="w-96 h-96"
									alt="QR code"
								/>
							{/if}
							{#if payment.status === 'pending'}
								{t('order.payToComplete')}
								{#if payment.method === 'bitcoin'}
									{t('order.payToCompleteBitcoin', { count: payment.confirmationBlocksRequired })}
								{/if}

								{#if payment.method === 'bankTransfer'}
									{#if data.sellerIdentity?.contact.email}
										<a
											href="mailto:{data.sellerIdentity.contact.email}"
											class="btn btn-black self-start"
										>
											{t('order.informSeller')}
										</a>
									{/if}
								{/if}
							{/if}
						{/if}
						{#if (payment.method === 'point-of-sale' || payment.method === 'bankTransfer') && data.roleId !== CUSTOMER_ROLE_ID && data.roleId && payment.status === 'pending'}
							<div class="flex flex-wrap gap-2">
								<form
									action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order
										._id}/payment/{payment.id}?/confirm"
									method="post"
									class="contents"
								>
									{#if payment.method === 'bankTransfer'}
										<input
											class="form-input w-auto"
											type="text"
											name="bankTransferNumber"
											required
											placeholder="bank transfer number"
										/>
									{/if}
									<button type="submit" class="btn btn-black">{t('pos.cta.markOrderPaid')}</button>
								</form>
								<form
									action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order
										._id}/payment/{payment.id}?/cancel"
									method="post"
									class="contents"
								>
									<button type="submit" class="btn btn-red">{t('pos.cta.cancelOrder')}</button>
								</form>
							</div>
						{/if}
					</div>
				</details>
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
					<p class="body-secondaryText whitespace-pre-line">
						{textAddress(data.order.shippingAddress)}
					</p>
				</div>
			{/if}

			{#if data.order.status === 'pending' && remainingAmount && data.roleId !== CUSTOMER_ROLE_ID && data.roleId}
				<form
					action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order
						._id}?/addPayment"
					method="post"
					class="contents"
				>
					<div class="flex flex-wrap gap-2">
						<label class="form-label">
							{t('order.addPayment.amount')}
							<input
								class="form-input"
								type="number"
								name="amount"
								min="0"
								step="any"
								max={remainingAmount}
								value={remainingAmount}
								required
							/>
						</label>
						<label class="form-label">
							{t('order.addPayment.currency')}
							<select name="currency" class="form-input" disabled>
								<option value={data.order.currencySnapshot.main.totalPrice.currency}
									>{data.order.currencySnapshot.main.totalPrice.currency}</option
								>
							</select>
						</label>
						<label class="form-label">
							<span>{t('checkout.payment.method')}</span>
							<select name="method" class="form-input">
								{#each data.paymentMethods as paymentMethod}
									<option value={paymentMethod}
										>{t(`checkout.paymentMethod.${paymentMethod}`)}</option
									>
								{/each}
							</select>
						</label><br />
						<button type="submit" class="btn btn-blue self-end">{t('order.addPayment.cta')}</button>
					</div>
				</form>
			{/if}
		</div>
		<div class="">
			<OrderSummary class="sticky top-4 -mr-2 -mt-2" order={data.order} />
		</div>
	</div>
</main>
