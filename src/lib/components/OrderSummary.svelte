<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import type { Order } from '$lib/types/Order';
	import type { Picture } from '$lib/types/Picture';
	import type { Product } from '$lib/types/Product';
	import PictureComponent from './Picture.svelte';
	import PriceTag from './PriceTag.svelte';
	import ProductType from './ProductType.svelte';
	import IconInfo from './icons/IconInfo.svelte';

	const { t } = useI18n();

	let classNames = '';
	export { classNames as class };
	export let order: Pick<
		Order,
		'shippingPrice' | 'vat' | 'discount' | 'amountsInOtherCurrencies'
	> & {
		items: Array<
			Pick<Order['items'][0], 'amountsInOtherCurrencies' | 'quantity'> & {
				digitalFiles: Array<{ _id: string }>;
				picture?: Picture;
				product: Pick<Product, '_id' | 'name' | 'preorder' | 'availableDate' | 'type' | 'shipping'>;
			}
		>;
	};
</script>

<article
	class="{classNames} rounded p-3 border border-gray-300 flex flex-col overflow-hidden gap-1"
>
	<div class="flex justify-between">
		{t('checkout.numProducts', { count: order.items.length ?? 0 })}
	</div>
	{#each order.items as item}
		<a href="/product/{item.product._id}">
			<h3 class="text-base">{item.product.name}</h3>
		</a>

		<div class="flex flex-row gap-2">
			<a
				href="/product/{item.product._id}"
				class="w-[50px] h-[50px] min-w-[50px] min-h-[50px] rounded flex items-center"
			>
				{#if item.picture}
					<PictureComponent
						picture={item.picture}
						class="rounded grow object-cover h-full w-full"
						sizes="50px"
					/>
				{/if}
			</a>
			<div class="flex flex-col">
				<div class="flex flex-wrap mb-1 gap-3">
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

	{#if order.shippingPrice?.amount}
		<div class="flex justify-between items-center">
			<h3 class="text-base">{t('checkout.deliveryFees')}</h3>

			<div class="flex flex-col ml-auto items-end justify-center">
				{#if order.amountsInOtherCurrencies.main.shippingPrice}
					<PriceTag
						class="text-2xl truncate"
						amount={order.amountsInOtherCurrencies.main.shippingPrice.amount}
						currency={order.amountsInOtherCurrencies.main.shippingPrice.currency}
					/>
				{/if}
				{#if order.amountsInOtherCurrencies.secondary?.shippingPrice}
					<PriceTag
						amount={order.amountsInOtherCurrencies.secondary.shippingPrice.amount}
						currency={order.amountsInOtherCurrencies.secondary.shippingPrice.currency}
						class="text-base truncate"
						secondary
					/>
				{/if}
			</div>
		</div>
		<div class="border-b border-gray-300 col-span-4" />
	{/if}

	{#if order.vat}
		<div class="flex justify-between items-center">
			<h3 class="text-base flex items-center gap-2">
				Vat ({order.vat.rate}%)
				<div title="VAT rate for {order.vat.country}">
					<IconInfo class="cursor-pointer" />
				</div>
			</h3>

			<div class="flex flex-col ml-auto items-end justify-center">
				{#if order.amountsInOtherCurrencies.main.vat}
					<PriceTag
						class="text-2xl truncate"
						amount={order.amountsInOtherCurrencies.main.vat.amount}
						currency={order.amountsInOtherCurrencies.main.vat.currency}
					/>
				{/if}
				{#if order.amountsInOtherCurrencies.secondary?.vat}
					<PriceTag
						amount={order.amountsInOtherCurrencies.secondary.vat.amount}
						currency={order.amountsInOtherCurrencies.secondary.vat.currency}
						class="text-base truncate"
					/>
				{/if}
			</div>
		</div>
		<div class="border-b border-gray-300 col-span-4" />
	{/if}

	{#if order?.discount}
		<div class="flex justify-between items-center">
			<h3 class="text-base flex items-center gap-2">
				{t('order.discount.title')}
			</h3>

			<div class="flex flex-col ml-auto items-end justify-center">
				{#if order.amountsInOtherCurrencies.main.discount}
					<PriceTag
						class="text-2xl truncate"
						amount={order.amountsInOtherCurrencies.main.discount.amount}
						currency={order.amountsInOtherCurrencies.main.discount.currency}
					/>
				{/if}
				{#if order.amountsInOtherCurrencies.secondary?.discount}
					<PriceTag
						amount={order.amountsInOtherCurrencies.secondary.discount.amount}
						currency={order.amountsInOtherCurrencies.secondary.discount.currency}
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
				amount={order.amountsInOtherCurrencies.main.totalPrice.amount}
				currency={order.amountsInOtherCurrencies.main.totalPrice.currency}
			/>
		</div>
		{#if order.amountsInOtherCurrencies.secondary?.totalPrice}
			<PriceTag
				class="self-end"
				amount={order.amountsInOtherCurrencies.secondary.totalPrice.amount}
				currency={order.amountsInOtherCurrencies.secondary.totalPrice.currency}
			/>
		{/if}
	</div>
</article>
