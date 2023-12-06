<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { useI18n } from '$lib/i18n.js';

	export let data;

	const identity = data.sellerIdentity;

	const { t, locale } = useI18n();
</script>

<div class="flex justify-between">
	<Picture picture={data.logoPicture} class="h-16" />
	<h2 class="text-xl">
		{identity.businessName}
	</h2>
</div>

<div class="mt-4">
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
	{#if data.order.shippingAddress}
		<p>{data.order.shippingAddress.firstName} {data.order.shippingAddress.lastName}</p>
		{#if data.order.shippingAddress.address}
			<p>{data.order.shippingAddress.address}</p>
		{/if}
		{#if data.order.shippingAddress.city || data.order.shippingAddress.zip}
			<p>{data.order.shippingAddress.zip} {data.order.shippingAddress.city}</p>
		{/if}
	{/if}
</div>

<div class="mt-4">
	<h2 class="text-2xl">{t('order.receipt.invoice')} n° {data.order.invoice?.number}</h2>
	<Trans key="order.createdAt">
		{t('order.createdAt')}:
		<time datetime={data.order.createdAt.toJSON()} slot="0">
			{data.order.createdAt.toLocaleDateString($locale)}
		</time>
	</Trans>
</div>

<p class="mt-4">{t('order.receipt.thanks', { businessName: identity.businessName })}</p>

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
				item.amountsInOtherCurrencies.main.customPrice?.amount ??
				item.amountsInOtherCurrencies.main.price.amount}
			{@const unitPrice = price / item.quantity}
			{@const priceCurrency =
				item.amountsInOtherCurrencies.main.customPrice?.currency ??
				item.amountsInOtherCurrencies.main.price.currency}
			<tr style:background-color={i % 2 === 0 ? '#fef2cc' : '#e7e6e6'}>
				<td class="text-center border border-white px-2">{i + 1}</td>
				<td class="text-left border border-white px-2">{item.product.name}</td>
				<td class="text-left border border-white px-2">{item.quantity}</td>
				<td class="text-left border border-white px-2">
					<PriceTag amount={unitPrice} currency={priceCurrency} />
				</td>
				<td class="text-left border border-white px-2">{data.order.vat?.rate ?? 0}%</td>
				<td class="text-left border border-white px-2">
					<PriceTag amount={(price * (data.order.vat?.rate ?? 0)) / 100} currency={priceCurrency} />
				</td>
				<td class="text-left border border-white px-2">
					<PriceTag
						amount={price + (price * (data.order.vat?.rate ?? 0)) / 100}
						currency={priceCurrency}
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
					? data.order.amountsInOtherCurrencies.main.totalPrice.amount
					: data.order.amountsInOtherCurrencies.main.totalPrice.currency ===
					  data.order.amountsInOtherCurrencies.main.vat?.currency
					? data.order.amountsInOtherCurrencies.main.totalPrice.amount -
					  data.order.amountsInOtherCurrencies.main.vat.amount
					: data.order.amountsInOtherCurrencies.main.totalPrice.amount /
					  (1 + (data.order.vat?.rate ?? 0) / 100)}
				currency={data.order.amountsInOtherCurrencies.main.totalPrice.currency}
				class="inline-flex"
			/>
		</td>
	</tr>
	<tr style:background-color="#e7e6e6">
		<td class="border border-white px-2 text-right">{t('order.receipt.totalVat')}</td>
		<td class="border border-white px-2 text-right whitespace-nowrap">
			<PriceTag
				amount={data.order.amountsInOtherCurrencies.main.vat?.amount ?? 0}
				currency={data.order.amountsInOtherCurrencies.main.vat?.currency ??
					data.order.amountsInOtherCurrencies.main.totalPrice.currency}
				class="inline-flex"
			/>
		</td>
	</tr>
	<tr style:background-color="#aeaaaa" class="text-white font-bold">
		<td class="border border-white px-2 text-right">{t('order.receipt.totalInclVat')}</td>
		<td class="border border-white px-2 whitespace-nowrap text-right">
			<PriceTag
				amount={data.order.amountsInOtherCurrencies.main.totalPrice.amount}
				currency={data.order.amountsInOtherCurrencies.main.totalPrice.currency}
				class="inline-flex"
			/>
		</td>
	</tr>
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
		padding: 1cm;
		width: 21cm;
	}
</style>
