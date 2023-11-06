<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import ProductType from '$lib/components/ProductType.svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import { CUSTOMER_ROLE_ID, POS_ROLE_ID } from '$lib/types/User.js';
	import { pluralize } from '$lib/utils/pluralize';
	import { toBitcoins } from '$lib/utils/toBitcoins';
	import { toSatoshis } from '$lib/utils/toSatoshis';
	import { differenceInMinutes, format } from 'date-fns';
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
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<div
		class="w-full rounded-xl bg-white border-gray-300 border p-6 grid flex md:grid-cols-3 sm:flex-wrap gap-2"
	>
		<div class="col-span-2 flex flex-col gap-2">
			<h1 class="text-3xl">Order #{data.order.number}</h1>
			{#if data.order.notifications?.paymentStatus?.npub}
				<p>
					NostR public address for payment status: <span class="font-mono break-all break-words">
						{data.order.notifications.paymentStatus.npub}</span
					>
				</p>
			{/if}
			{#if data.order.payment.status !== 'expired' && data.order.payment.status !== 'canceled'}
				<div>
					Keep this link: <a class="underline text-link break-all break-words" href={$page.url.href}
						>{$page.url.href}</a
					> to access the order later.
				</div>
			{/if}

			{#if data.order.payment.status === 'pending'}
				{#if data.order.payment.method === 'cash'}
					<p class="text-xl">Your order awaits confirmation from the seller.</p>
				{:else}
					<ul>
						<li>
							Payment address: <code class="break-words break-all"
								>{data.order.payment.address}</code
							>
						</li>
						<li>
							Payment amount: <code class="break-words">
								{(data.order.payment.method === 'bitcoin'
									? toBitcoins(data.order.totalPrice.amount, data.order.totalPrice.currency)
									: toSatoshis(data.order.totalPrice.amount, data.order.totalPrice.currency)
								).toLocaleString('en-US', { maximumFractionDigits: 8 })}
								{data.order.payment.method === 'bitcoin' ? 'BTC' : 'sats'}
							</code>
						</li>
						<li>
							Time remaining: {differenceInMinutes(data.order.payment.expiresAt, currentDate)} minutes
						</li>
					</ul>
					<img src="{$page.url.pathname}/qrcode" class="w-96 h-96" alt="QR code" />
					<div class="text-xl">
						Pay to complete the order. {#if data.order.payment.method === 'bitcoin'}
							Order will be marked as paid after {data.confirmationBlocksRequired}
							{pluralize(data.confirmationBlocksRequired, 'confirmation')}.{/if}
					</div>
				{/if}
			{:else if data.order.payment.status === 'paid'}
				<p>Order <span class="text-green-500">paid</span>!</p>
			{:else if data.order.payment.status === 'expired'}
				<p>Order expired!</p>
			{:else if data.order.payment.status === 'canceled'}
				<p class="font-bold">Order canceled!</p>
			{/if}

			{#if data.digitalFiles.length}
				<h2 class="text-2xl">Digital Files</h2>
				<ul>
					{#each data.digitalFiles as digitalFile}
						<li>
							{#if digitalFile.link}
								<a href={digitalFile.link} class="text-link hover:underline" target="_blank"
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
				<p>This order is free of VAT. Reason: {data.order.vatFree.reason}</p>
			{/if}
			<p class="text-base">
				Created at
				<time
					datetime={data.order.createdAt.toJSON()}
					title={data.order.createdAt.toLocaleString('en')}
					>{format(data.order.createdAt, 'dd-MM-yyyy HH:mm:ss')}</time
				>
			</p>

			{#if data.order.shippingAddress}
				<div>
					Shipping address: <pre class="break-words">{JSON.stringify(
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
					<button type="submit" class="btn btn-black">Mark paid</button>
				</form>
				<form
					action="/{data.roleId === POS_ROLE_ID ? 'pos' : 'admin'}/order/{data.order._id}?/cancel"
					method="post"
				>
					<button type="submit" class="btn btn-red">Cancel</button>
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
					{data.order.items.length}
					{pluralize(data.order.items.length ?? 0, 'product')}
				</div>
				{#each data.order.items as item}
					<a href="/product/{item.product._id}">
						<h3 class="text-base text-gray-700">{item.product.name}</h3>
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
									Quantity: {item.quantity}
								{/if}
							</div>
						</div>

						<div class="flex flex-col ml-auto items-end justify-center">
							{#if item.customPrice}
								<PriceTag
									class="text-2xl text-gray-800 truncate"
									amount={item.quantity * item.customPrice.amount}
									currency={item.customPrice.currency}
									main
								/>
								<PriceTag
									amount={item.quantity * item.customPrice.amount}
									currency={item.customPrice.currency}
									class="text-base text-gray-600 truncate"
									secondary
								/>
							{:else}
								<PriceTag
									class="text-2xl text-gray-800 truncate"
									amount={item.quantity * item.product.price.amount}
									currency={item.product.price.currency}
									main
								/>
								<PriceTag
									amount={item.quantity * item.product.price.amount}
									currency={item.product.price.currency}
									class="text-base text-gray-600 truncate"
									secondary
								/>
							{/if}
						</div>
					</div>

					<div class="border-b border-gray-300 col-span-4" />
				{/each}

				{#if data.order.shippingPrice}
					<div class="flex justify-between items-center">
						<h3 class="text-base text-gray-700">Delivery fees</h3>

						<div class="flex flex-col ml-auto items-end justify-center">
							<PriceTag
								class="text-2xl text-gray-800 truncate"
								amount={data.order.shippingPrice.amount}
								currency={data.order.shippingPrice.currency}
								main
							/>
							<PriceTag
								amount={data.order.shippingPrice.amount}
								currency={data.order.shippingPrice.currency}
								class="text-base text-gray-600 truncate"
								secondary
							/>
						</div>
					</div>
					<div class="border-b border-gray-300 col-span-4" />
				{/if}

				{#if data.order.vat}
					<div class="flex justify-between items-center">
						<h3 class="text-base text-gray-700 flex items-center gap-2">
							Vat ({data.order.vat.rate}%)
							<div title="VAT rate for {data.order.vat.country}">
								<IconInfo class="cursor-pointer" />
							</div>
						</h3>

						<div class="flex flex-col ml-auto items-end justify-center">
							<PriceTag
								class="text-2xl text-gray-800 truncate"
								amount={data.order.vat.price.amount}
								currency={data.order.vat.price.currency}
								main
							/>
							<PriceTag
								amount={data.order.vat.price.amount}
								currency={data.order.vat.price.currency}
								class="text-base text-gray-600 truncate"
								secondary
							/>
						</div>
					</div>
					<div class="border-b border-gray-300 col-span-4" />
				{/if}

				{#if data.order?.discount}
					<div class="flex justify-between items-center">
						<h3 class="text-base text-gray-700 flex items-center gap-2">Discount</h3>

						<div class="flex flex-col ml-auto items-end justify-center">
							<PriceTag
								class="text-2xl text-gray-800 truncate"
								amount={data.order.discount.price.amount}
								currency={data.order.discount.price.currency}
								main
							/>
							<PriceTag
								amount={data.order.discount.price.amount}
								currency={data.order.discount.price.currency}
								class="text-base text-gray-600 truncate"
								secondary
							/>
						</div>
					</div>
					<div class="border-b border-gray-300 col-span-4" />
				{/if}

				<span class="py-1" />

				<div class="bg-gray-190 -mx-3 p-3 flex flex-col">
					<div class="flex justify-between">
						<span class="text-xl text-gray-850">Total</span>
						<PriceTag
							class="text-2xl text-gray-800"
							amount={data.order.totalPrice.amount}
							currency={data.order.totalPrice.currency}
							main
						/>
					</div>
					<PriceTag
						class="self-end text-gray-600"
						amount={data.order.totalPrice.amount}
						currency={data.order.totalPrice.currency}
						secondary
					/>
				</div>
			</article>
		</div>
	</div>
</main>
