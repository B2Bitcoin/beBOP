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
	import IconSumupWide from '$lib/components/icons/IconSumupWide.svelte';

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
											<a href={trimOrigin(payment.address ?? '')} class="body-hyperlink">
												<span>{t('order.paymentLink')}</span>
												<IconSumupWide class="h-12" />
											</a>
										{:else if payment.method === 'bank-transfer'}
											<p>
												{t('order.paymentIban')}:
												<code class="break-words body-secondaryText break-all">
													{data.sellerIdentity?.bank?.iban.replace(/.{4}(?=.)/g, '$& ')}
												</code>
											</p>
											<p>
												{t('order.paymentBic')}:
												<code class="break-words body-secondaryText break-all">
													{data.sellerIdentity?.bank?.bic}
												</code>
											</p>
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

								{#if payment.method === 'bank-transfer'}
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
						{#if (payment.method === 'point-of-sale' || payment.method === 'bank-transfer') && data.roleId !== CUSTOMER_ROLE_ID && data.roleId && payment.status === 'pending'}
							<div class="flex flex-wrap gap-2">
								<form
									action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order
										._id}/payment/{payment.id}?/confirm"
									method="post"
									class="contents"
								>
									{#if payment.method === 'bank-transfer'}
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

			{#if data.roleId !== CUSTOMER_ROLE_ID && data.roleId}
				<form
					action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order._id}?/saveNote"
					method="post"
					class="contents"
				>
					<section class="gap-4 flex flex-col">
						<article class="rounded border border-gray-300 overflow-hidden flex flex-col">
							<div class="p-4 flex flex-col gap-3">
								<label class="form-label text-2xl">
									{t('order.note.label')}

									<textarea name="noteContent" cols="30" rows="2" class="form-input" />
								</label>
							</div>
						</article>
						<div class="flex flex-wrap gap-3 justify-between">
							<button type="submit" class="btn btn-blue self-start"
								>{t('order.note.saveText')}</button
							>
							<a href="/order/{data.order._id}/notes" class="btn btn-gray self-end"
								>{t('order.note.seeText')}</a
							>
						</div>
					</section>
				</form>
			{/if}
		</div>

		<div class="">
			<OrderSummary class="sticky top-4 -mr-2 -mt-2" order={data.order} />
		</div>
	</div>
</main>
