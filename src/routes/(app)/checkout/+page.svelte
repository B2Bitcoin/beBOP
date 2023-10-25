<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { COUNTRIES } from '$lib/types/Country';
	import { bech32 } from 'bech32';
	import { typedValues } from '$lib/utils/typedValues';
	import { pluralize } from '$lib/utils/pluralize';
	import { typedInclude } from '$lib/utils/typedIncludes';
	import ProductType from '$lib/components/ProductType.svelte';
	import { computeDeliveryFees } from '$lib/types/Cart';
	import { typedKeys } from '$lib/utils/typedKeys';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';
	import { sumCurrency } from '$lib/utils/sumCurrency';
	import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding.js';
	import { toCurrency } from '$lib/utils/toCurrency.js';
	import { UNDERLYING_CURRENCY } from '$lib/types/Currency.js';

	let actionCount = 0;
	let country = typedKeys(COUNTRIES)[0];

	export let data;
	let ipCollect = false;

	const feedItems = [
		{ key: 'paymentStatus', label: 'Payment status' }
		// { key: 'productChanges', label: 'Product changes' },
		// { key: 'newsletter', label: 'Newsletter' }
	] as const;

	type FeedKey = (typeof feedItems)[number]['key'];

	const npubInputs: Record<FeedKey, HTMLInputElement | null> = {
		paymentStatus: null
		// productChanges: null,
		// newsletter: null
	};

	const emails: Record<FeedKey, string> = {
		paymentStatus: data.email || ''
	};

	function checkForm(event: SubmitEvent) {
		for (const input of typedValues(npubInputs)) {
			if (!input) {
				continue;
			}

			input.value = input.value.trim();

			if (
				input.value &&
				(!input.value.startsWith('npub1') || bech32.decodeUnsafe(input.value)?.prefix !== 'npub')
			) {
				input.setCustomValidity('Invalid NostR public address');
				input.reportValidity();

				event.preventDefault();
				return;
			}
		}
	}

	$: paymentMethods = data.paymentMethods.filter((method) =>
		method === 'bitcoin' ? totalSatoshi >= 10_000 : true
	);

	const paymentMethodDesc = {
		bitcoin: 'Onchain',
		lightning: 'Lightning',
		cash: 'Cash'
	};

	let paymentMethod: (typeof paymentMethods)[0] | undefined = undefined;
	$: paymentMethod = typedInclude(paymentMethods, paymentMethod)
		? paymentMethod
		: paymentMethods[0];

	$: items = data.cart || [];
	$: deliveryFees = computeDeliveryFees('SAT', country, items, data.deliveryFees);

	$: isDigital = items.every((item) => !item.product.shipping);
	$: actualCountry = isDigital || data.vatSingleCountry ? data.vatCountry : country;
	$: actualVatRate =
		isDigital || data.vatSingleCountry ? data.vatRate : data.vatRates[actualCountry] ?? 0;

	$: totalPrice =
		sumCurrency(
			UNDERLYING_CURRENCY,
			items.map((item) => ({
				currency: (item.customPrice || item.product.price).currency,
				amount: (item.customPrice || item.product.price).amount * item.quantity
			}))
		) + (deliveryFees || 0);

	$: vat = fixCurrencyRounding(totalPrice * (actualVatRate / 100), UNDERLYING_CURRENCY);
	$: totalPriceWithVat = totalPrice + vat;
	$: totalSatoshi = toCurrency('SAT', totalPriceWithVat, UNDERLYING_CURRENCY);
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<div
		class="w-full rounded-xl bg-white border-gray-300 border p-6 md:grid gap-4 md:gap-2 flex md:grid-cols-3 sm:flex-wrap"
	>
		<form id="checkout" method="post" class="col-span-2 flex gap-4 flex-col" on:submit={checkForm}>
			<h1 class="page-title">Checkout</h1>

			<section class="gap-4 grid grid-cols-6 w-4/5">
				<h2 class="font-light text-2xl col-span-6">Shipment info</h2>

				{#if isDigital}
					<p class="col-span-6 text-gray-800">
						All products in your cart are digital products. You don't need to provide any shipping
						information.
					</p>
				{:else}
					<label class="form-label col-span-3">
						First name
						<input
							type="text"
							class="form-input"
							name="firstName"
							autocomplete="given-name"
							required
						/>
					</label>

					<label class="form-label col-span-3">
						Last name
						<input
							type="text"
							class="form-input"
							name="lastName"
							autocomplete="family-name"
							required
						/>
					</label>

					<label class="form-label col-span-6">
						Address
						<input
							type="text"
							class="form-input"
							autocomplete="street-address"
							name="address"
							required
						/>
					</label>

					<label class="form-label col-span-3">
						Country
						<select name="country" class="form-input" required bind:value={country}>
							{#each Object.entries(COUNTRIES) as [code, countryTxt]}
								<option value={code} selected={code === country}>{countryTxt}</option>
							{/each}
						</select>
					</label>

					<span class="col-span-3" />

					<label class="form-label col-span-2">
						State

						<input type="text" name="state" class="form-input" />
					</label>
					<label class="form-label col-span-2">
						City

						<input type="text" name="city" class="form-input" required />
					</label>
					<label class="form-label col-span-2">
						Zip code

						<input type="text" name="zip" class="form-input" required autocomplete="postal-code" />
					</label>
				{/if}
			</section>

			<section class="gap-4 flex flex-col">
				<h2 class="font-light text-2xl">Payment</h2>

				<label class="form-label">
					Payment method

					<div class="grid grid-cols-2 gap-4 items-center">
						<select
							name="paymentMethod"
							class="form-input"
							bind:value={paymentMethod}
							disabled={paymentMethods.length === 0}
							required
						>
							{#each paymentMethods as paymentMethod}
								<option value={paymentMethod}>{paymentMethodDesc[paymentMethod]}</option>
							{/each}
						</select>
						{#if paymentMethods.length === 0}
							<p class="text-red-400">No payment methods available.</p>
						{/if}
						{#if 0}
							<a href="/connect" class="underline text-link"> Connect another wallet </a>
						{/if}
					</div>
				</label>

				{#if paymentMethod === 'cash'}
					<p class="alert-info">Cash payments need manual confirmation from the seller.</p>
				{/if}
			</section>

			<section class="gap-4 flex flex-col">
				<h2 class="font-light text-2xl">Feed & Notifications</h2>

				{#each feedItems as { key, label }}
					<article class="rounded border border-gray-300 overflow-hidden flex flex-col">
						<div
							class="pl-4 py-2 bg-gray-190 border-b border-gray-300 text-base font-light text-gray-800"
						>
							{label}
						</div>
						<div class="p-4 flex flex-col gap-3">
							<label class="form-label">
								NostR public address
								<input
									type="text"
									class="form-input"
									bind:this={npubInputs[key]}
									name="{key}NPUB"
									value={data.npub || ''}
									placeholder="npub1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
									required={key === 'paymentStatus' && !emails[key] && paymentMethod !== 'cash'}
									on:change={(ev) => ev.currentTarget.setCustomValidity('')}
								/>
							</label>
							{#if data.emailsEnabled}
								<label class="form-label">
									Email
									<input
										type="email"
										class="form-input"
										autocomplete="email"
										name="{key}Email"
										bind:value={emails[key]}
									/>
								</label>
							{/if}
						</div>
					</article>
				{/each}
			</section>
		</form>
		<div class="w-full md:w-auto">
			<article
				class="rounded sticky top-4 md:-mr-2 md:-mt-2 p-3 border border-gray-300 flex flex-col overflow-hidden gap-1"
			>
				<div class="flex justify-between">
					<a href="/cart" class="text-link hover:underline">&lt;&lt;Back to cart</a>
					<p>{data.cart?.length} {pluralize(data.cart?.length ?? 0, 'product')}</p>
				</div>
				{#each items as item}
					<form
						method="POST"
						class="flex flex-col mt-2"
						use:enhance={({ action }) => {
							if (action.searchParams.has('/increase')) {
								item.quantity++;
							} else if (action.searchParams.has('/decrease')) {
								item.quantity--;
							} else if (action.searchParams.has('/remove')) {
								item.quantity = 0;
							}
							actionCount++;
							let currentActionCount = actionCount;

							return async ({ result }) => {
								if (actionCount === currentActionCount) {
									if (result.type === 'redirect') {
										// Invalidate all to remove 0-quantity items
										await goto(result.location, { noScroll: true, invalidateAll: true });
										return;
									}
									await applyAction(result);
								}
							};
						}}
					>
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
										class="mx-auto rounded h-full object-contain"
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
									{#if 0}
										<CartQuantity {item} sm />
									{:else if item.quantity > 1}
										Quantity: {item.quantity}
									{/if}
								</div>
							</div>

							<div class="flex flex-col ml-auto items-end justify-center">
								{#if item.product.type !== 'subscription' && item.customPrice}
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
					</form>

					<div class="border-b border-gray-300 col-span-4" />
				{/each}

				{#if deliveryFees}
					<div class="flex justify-between items-center">
						<h3 class="text-base text-gray-700">Delivery fees</h3>

						<div class="flex flex-col ml-auto items-end justify-center">
							<PriceTag
								class="text-2xl text-gray-800 truncate"
								amount={deliveryFees}
								currency={UNDERLYING_CURRENCY}
								main
							/>
							<PriceTag
								amount={deliveryFees}
								currency={UNDERLYING_CURRENCY}
								class="text-base text-gray-600 truncate"
								secondary
							/>
						</div>
					</div>
					<div class="border-b border-gray-300 col-span-4" />
				{:else if isNaN(deliveryFees)}
					<div class="alert-error mt-3">
						Delivery is not available in your country for some of the items of your cart.
					</div>
				{/if}

				{#if data.vatCountry && !data.vatExempted}
					<div class="flex justify-between items-center">
						<div class="flex flex-col">
							<h3 class="text-base text-gray-700 flex flex-row gap-2 items-center">
								Vat ({actualVatRate}%)
								<div
									title="VAT rate for {actualCountry}. {data.vatSingleCountry
										? "The VAT country is the seller's country"
										: isDigital
										? 'The country is determined with data from https://lite.ip2location.com'
										: 'The country is determined by the shipping address'}"
								>
									<IconInfo class="cursor-pointer" />
								</div>
							</h3>
						</div>

						<div class="flex flex-col ml-auto items-end justify-center">
							<PriceTag
								class="text-2xl text-gray-800 truncate"
								amount={vat}
								currency={UNDERLYING_CURRENCY}
								main
							/>
							<PriceTag
								amount={vat}
								currency={UNDERLYING_CURRENCY}
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
							amount={totalPriceWithVat}
							currency={UNDERLYING_CURRENCY}
							main
						/>
					</div>
					<PriceTag
						class="self-end text-gray-600"
						amount={totalPriceWithVat}
						currency={UNDERLYING_CURRENCY}
						secondary
					/>
				</div>

				<label class="checkbox-label">
					<input type="checkbox" class="form-checkbox" name="teecees" form="checkout" required />
					<span>
						I agree to the <a href="/terms" target="_blank" class="text-link hover:underline">
							terms of service
						</a>
					</span>
				</label>
				{#if data.ipCollect}
					<label class="checkbox-label">
						<input type="checkbox" class="form-checkbox" name="allowCollectIP" form="checkout" />
						<span>
							I agree to the collect of my IP address( <a
								href="/why-collect-ip"
								target="_blank"
								class="text-link hover:underline"
							>
								why ?)
							</a>
						</span>
					</label>
				{/if}

				<input
					type="submit"
					class="btn btn-black btn-xl -mx-1 -mb-1 mt-1"
					value="Proceed"
					form="checkout"
					disabled={isNaN(deliveryFees)}
				/>
			</article>
		</div>
	</div>
</main>
