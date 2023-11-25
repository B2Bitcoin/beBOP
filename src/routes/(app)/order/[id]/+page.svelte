<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import ProductType from '$lib/components/ProductType.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';
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
		</div>
		<div class="">
			<article
				class="rounded sticky top-4 -mr-2 -mt-2 p-3 border border-gray-300 flex flex-col overflow-hidden gap-1"
			>
				<div class="flex justify-between">
					{t('checkout.numProducts', { count: data.order.items.length ?? 0 })}
				</div>
				{#each data.order.items as item}
					<a href="/product/{item.product._id}">
						<h3 class="text-base">{item.product.name}</h3>
					</a>

					<div class="flex flex-row gap-2">
						<a
							href="/product/{item.product._id}"
							class="w-[50px] h-[50px] min-w-[50px] min-h-[50px] rounded flex items-center"
						>
							{#if item.picture}
								<Picture
									picture={item.picture}
									class="rounded grow object-cover h-full w-full"
									sizes="50px"
								/>
							{/if}
						</a>
						<div class="flex flex-col">
							<div class="flex flex-row gap-2">
								<ProductType
									product={item.product}
									class="text-sm"
									hasDigitalFiles={item.digitalFiles.length >= 1}
								/>
							</div>
							<div>
								{#if item.quantity > 1}
									{t('cart.quantity')}: {item.quantity}
								{/if}
							</div>
						</div>

						<div class="flex flex-col ml-auto items-end justify-center">
							<PriceTag
								class="text-2xl truncate"
								amount={item.quantity *
									(item.amountsInOtherCurrencies.main.customPrice?.amount ??
										item.amountsInOtherCurrencies.main.price.amount)}
								currency={item.amountsInOtherCurrencies.main.customPrice?.currency ??
									item.amountsInOtherCurrencies.main.price.currency}
							/>
							{#if item.amountsInOtherCurrencies.secondary}
								<PriceTag
									class="text-2xl truncate"
									amount={item.quantity *
										(item.amountsInOtherCurrencies.secondary.customPrice?.amount ??
											item.amountsInOtherCurrencies.secondary.price.amount)}
									currency={item.amountsInOtherCurrencies.secondary.customPrice?.currency ??
										item.amountsInOtherCurrencies.secondary.price.currency}
								/>
							{/if}
						</div>
					</div>

					<div class="border-b border-gray-300 col-span-4" />
				{/each}

				{#if data.order.shippingPrice}
					<div class="flex justify-between items-center">
						<h3 class="text-base">{t('checkout.deliveryFees')}</h3>

						<div class="flex flex-col ml-auto items-end justify-center">
							{#if data.order.amountsInOtherCurrencies.main.shippingPrice}
								<PriceTag
									class="text-2xl truncate"
									amount={data.order.amountsInOtherCurrencies.main.shippingPrice.amount}
									currency={data.order.amountsInOtherCurrencies.main.shippingPrice.currency}
								/>
							{/if}
							{#if data.order.amountsInOtherCurrencies.secondary?.shippingPrice}
								<PriceTag
									amount={data.order.amountsInOtherCurrencies.secondary.shippingPrice.amount}
									currency={data.order.amountsInOtherCurrencies.secondary.shippingPrice.currency}
									class="text-base truncate"
									secondary
								/>
							{/if}
						</div>
					</div>
					<div class="border-b border-gray-300 col-span-4" />
				{/if}

				{#if data.order.vat}
					<div class="flex justify-between items-center">
						<h3 class="text-base flex items-center gap-2">
							Vat ({data.order.vat.rate}%)
							<div title="VAT rate for {data.order.vat.country}">
								<IconInfo class="cursor-pointer" />
							</div>
						</h3>

						<div class="flex flex-col ml-auto items-end justify-center">
							{#if data.order.amountsInOtherCurrencies.main.vat}
								<PriceTag
									class="text-2xl truncate"
									amount={data.order.amountsInOtherCurrencies.main.vat.amount}
									currency={data.order.amountsInOtherCurrencies.main.vat.currency}
								/>
							{/if}
							{#if data.order.amountsInOtherCurrencies.secondary?.vat}
								<PriceTag
									amount={data.order.amountsInOtherCurrencies.secondary.vat.amount}
									currency={data.order.amountsInOtherCurrencies.secondary.vat.currency}
									class="text-base truncate"
								/>
							{/if}
						</div>
					</div>
					<div class="border-b border-gray-300 col-span-4" />
				{/if}

				{#if data.order?.discount}
					<div class="flex justify-between items-center">
						<h3 class="text-base flex items-center gap-2">
							{t('order.discount.title')}
						</h3>

						<div class="flex flex-col ml-auto items-end justify-center">
							{#if data.order.amountsInOtherCurrencies.main.discount}
								<PriceTag
									class="text-2xl truncate"
									amount={data.order.amountsInOtherCurrencies.main.discount.amount}
									currency={data.order.amountsInOtherCurrencies.main.discount.currency}
								/>
							{/if}
							{#if data.order.amountsInOtherCurrencies.secondary?.discount}
								<PriceTag
									amount={data.order.amountsInOtherCurrencies.secondary.discount.amount}
									currency={data.order.amountsInOtherCurrencies.secondary.discount.currency}
									class="text-base truncate"
								/>
							{/if}
						</div>
					</div>
					<div class="border-b border-gray-300 col-span-4" />
				{/if}

				<span class="py-1" />

				<div class="-mx-3 p-3 flex flex-col">
					<div class="flex justify-between">
						<span class="text-xl">{t('cart.total')}</span>
						<PriceTag
							class="text-2xl"
							amount={data.order.amountsInOtherCurrencies.main.totalPrice.amount}
							currency={data.order.amountsInOtherCurrencies.main.totalPrice.currency}
						/>
					</div>
					{#if data.order.amountsInOtherCurrencies.secondary?.totalPrice}
						<PriceTag
							class="self-end"
							amount={data.order.amountsInOtherCurrencies.secondary.totalPrice.amount}
							currency={data.order.amountsInOtherCurrencies.secondary.totalPrice.currency}
						/>
					{/if}
				</div>
			</article>
		</div>
	</div>
</main>
