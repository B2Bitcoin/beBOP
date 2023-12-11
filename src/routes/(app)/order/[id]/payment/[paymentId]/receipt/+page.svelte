<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { useI18n } from '$lib/i18n.js';

	export let data;

	const identity = data.sellerIdentity;

	const { t, locale, textAddress } = useI18n();
	const differentAddress =
		data.order.shippingAddress &&
		data.order.billingAddress &&
		textAddress(data.order.shippingAddress) !== textAddress(data.order.billingAddress);
</script>

<div class="flex justify-between">
	<Picture picture={data.logoPicture} class="h-16" />
	<h2 class="text-xl whitespace-pre-wrap text-right">
		{identity.invoice?.issuerInfo || ''}
	</h2>
</div>

<div class="mt-4">
	<p>{identity.businessName}</p>
	{#if identity.vatNumber}
		<p>VAT Number: {identity.vatNumber}</p>
	{/if}
	{#if identity.address.street}
		<p>{identity.address.street}</p>
	{/if}
	{#if identity.address.city || identity.address.zip}
		<p>{identity.address.zip} {identity.address.city}</p>
	{/if}
</div>

<div class="mt-4 text-right">
	{#if data.order.notifications.paymentStatus.email}
		<p>{data.order.notifications.paymentStatus.email}</p>
	{/if}
	{#if data.order.billingAddress}
		{#if differentAddress}
			<p class="font-bold">{t('checkout.billingInfo')}</p>
		{/if}
		<p class="whitespace-pre-wrap">{textAddress(data.order.billingAddress)}</p>
		{#if data.order.shippingAddress && differentAddress}
			<br />
			<p class="font-bold">{t('order.shippingAddress.title')}</p>
			<p class="whitespace-pre-wrap">{textAddress(data.order.shippingAddress)}</p>
		{/if}
	{/if}
</div>

<div class="mt-4">
	<h2 class="text-2xl">{t('order.receipt.invoice')} n° {data.payment.invoice?.number}</h2>
	<Trans key="order.createdAt">
		{t('order.createdAt')}:
		<time datetime={data.order.createdAt.toJSON()} slot="0">
			{data.order.createdAt.toLocaleDateString($locale)}
		</time>
	</Trans>
</div>

<table class="mt-4 border-collapse">
	<thead style:background-color="#aeaaaa" class="text-white">
		<tr>
			<th class="text-center border border-white">N°</th>
			<th class="text-center border border-white">{t('order.receipt.itemName')}</th>
			<th class="text-center border border-white">{t('order.receipt.quantity')}</th>
			<th class="text-center border border-white">{t('order.receipt.unitPrice')}</th>
			<th class="text-center border border-white">{t('cart.vat')} (%)</th>
			<th class="text-center border border-white">{t('cart.vat')}</th>
			<th class="text-center border border-white">{t('order.receipt.totalInclVat')}</th>
		</tr>
	</thead>
	<tbody>
		{#each data.order.items as item, i}
			{@const price =
				item.currencySnapshot.main.customPrice?.amount ?? item.currencySnapshot.main.price.amount}
			{@const unitPrice = price / item.quantity}
			{@const priceCurrency =
				item.currencySnapshot.main.customPrice?.currency ??
				item.currencySnapshot.main.price.currency}
			<tr style:background-color={i % 2 === 0 ? '#fef2cc' : '#e7e6e6'}>
				<td class="text-center border border-white px-2">{i + 1}</td>
				<td class="text-center border border-white px-2">{item.product.name}</td>
				<td class="text-center border border-white px-2">{item.quantity}</td>
				<td class="text-center border border-white px-2">
					<PriceTag amount={unitPrice} currency={priceCurrency} inline />
				</td>
				<td class="text-center border border-white px-2">{data.order.vat?.rate ?? 0}%</td>
				<td class="text-center border border-white px-2">
					<PriceTag
						amount={(price * (data.order.vat?.rate ?? 0)) / 100}
						currency={priceCurrency}
						inline
					/>
				</td>
				<td class="text-right border border-white px-2">
					<PriceTag
						amount={price + (price * (data.order.vat?.rate ?? 0)) / 100}
						currency={priceCurrency}
						inline
					/>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<table class="mt-4 border-collapse">
	<tr style:background-color="#fef2cc">
		<td class="border border-white px-2 text-right" style="width: 70%"
			>{t('order.receipt.totalExcVat')}</td
		>
		<td class="border border-white px-2 text-right whitespace-nowrap">
			<PriceTag
				amount={data.order.vat?.price.amount === 0
					? data.order.currencySnapshot.main.totalPrice.amount
					: data.order.currencySnapshot.main.totalPrice.currency ===
					  data.order.currencySnapshot.main.vat?.currency
					? data.order.currencySnapshot.main.totalPrice.amount -
					  data.order.currencySnapshot.main.vat.amount
					: data.order.currencySnapshot.main.totalPrice.amount /
					  (1 + (data.order.vat?.rate ?? 0) / 100)}
				currency={data.order.currencySnapshot.main.totalPrice.currency}
				inline
			/>
		</td>
	</tr>
	<tr style:background-color="#e7e6e6">
		<td class="border border-white px-2 text-right">{t('order.receipt.totalVat')}</td>
		<td class="border border-white px-2 text-right whitespace-nowrap">
			<PriceTag
				amount={data.order.currencySnapshot.main.vat?.amount ?? 0}
				currency={data.order.currencySnapshot.main.vat?.currency ??
					data.order.currencySnapshot.main.totalPrice.currency}
				inline
			/>
		</td>
	</tr>
	<tr style:background-color="#aeaaaa" class="text-white font-bold">
		<td class="border border-white px-2 text-right">{t('order.receipt.totalInclVat')}</td>
		<td class="border border-white px-2 whitespace-nowrap text-right">
			<PriceTag
				amount={data.order.currencySnapshot.main.totalPrice.amount}
				currency={data.order.currencySnapshot.main.totalPrice.currency}
				inline
			/>
		</td>
	</tr>
	{#if data.payment.currencySnapshot.main.previouslyPaid?.amount}
		<tr style:background-color="#aeaaaa" class="text-white font-bold">
			<td class="border border-white px-2 text-right">{t('order.receipt.alreadyPaidAmount')}</td>
			<td class="border border-white px-2 whitespace-nowrap text-right">
				<PriceTag
					amount={data.payment.currencySnapshot.main.previouslyPaid.amount}
					currency={data.payment.currencySnapshot.main.previouslyPaid.currency}
					inline
				/>
			</td>
		</tr>
	{/if}
	{#if data.payment.currencySnapshot.main.price.amount !== data.order.currencySnapshot.main.totalPrice.amount}
		<tr style:background-color="#aeaaaa" class="text-white font-bold">
			<td class="border border-white px-2 text-right">{t('order.receipt.partialAmount')}</td>
			<td class="border border-white px-2 whitespace-nowrap text-right">
				<PriceTag
					amount={data.payment.currencySnapshot.main.price.amount}
					currency={data.payment.currencySnapshot.main.price.currency}
					inline
				/>
			</td>
		</tr>
	{/if}
	{#if data.payment.currencySnapshot.main.remaningToPay?.amount}
		<tr style:background-color="#aeaaaa" class="text-white font-bold">
			<td class="border border-white px-2 text-right">{t('order.receipt.remainingAmount')}</td>
			<td class="border border-white px-2 whitespace-nowrap text-right">
				<PriceTag
					amount={data.payment.currencySnapshot.main.remaningToPay.amount}
					currency={data.payment.currencySnapshot.main.remaningToPay.currency}
					inline
				/>
			</td>
		</tr>
	{/if}
</table>

<div class="mt-4">
	<Trans key="order.receipt.endMessage" params={{ businessName: identity.businessName }}>
		<br slot="0" />
		<br slot="1" />
	</Trans>
</div>

{#if identity.bank}
	<div class="mt-4 text-right">
		<h2 class="text-xl">{t('order.receipt.bankInfo')} :</h2>
		<table class="ml-auto">
			<tr><td class="px-2">IBAN</td><td>{identity.bank.iban}</td></tr>
			<tr><td class="px-2">BIC</td><td>{identity.bank.bic}</td></tr>
		</table>
	</div>
{/if}

<style global>
	@page {
		size: portrait;
	}
	:global(html) {
		print-color-adjust: exact;
		/** 
			Margin for pdf generation. Some printers automatically add margin, some not. We add margin
			just in case, but later we should print the pdfs ourselves for standardized margins. 
		*/
		padding: 0.5cm;
		width: 21cm;
	}
</style>
