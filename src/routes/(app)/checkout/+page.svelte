<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { bech32 } from 'bech32';
	import { typedValues } from '$lib/utils/typedValues';
	import { typedInclude } from '$lib/utils/typedIncludes';
	import ProductType from '$lib/components/ProductType.svelte';
	import { computeDeliveryFees } from '$lib/types/Cart';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';
	import { sumCurrency } from '$lib/utils/sumCurrency';
	import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding.js';
	import { toCurrency } from '$lib/utils/toCurrency.js';
	import { UNDERLYING_CURRENCY } from '$lib/types/Currency.js';
	import { POS_ROLE_ID } from '$lib/types/User.js';
	import { toSatoshis } from '$lib/utils/toSatoshis';
	import type { DiscountType } from '$lib/types/Order.js';
	import { useI18n } from '$lib/i18n';
	import Trans from '$lib/components/Trans.svelte';
	import { vatRate, type CountryAlpha2 } from '$lib/types/Country.js';

	export let data;

	let actionCount = 0;
	const defaultCountry =
		(data.personalInfoConnected?.address?.country ?? (data.countryCode as CountryAlpha2)) ||
		(data.vatCountry as CountryAlpha2);
	let country = defaultCountry;

	let isFreeVat = false;
	let addDiscount = false;
	let discountAmount: number;
	let discountType: DiscountType;

	const { t, locale, countryName, sortedCountryCodes } = useI18n();

	const feedItems = [
		{ key: 'paymentStatus', label: t('checkout.paymentStatus') }
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
				input.setCustomValidity(t('checkout.invalidNpub'));
				input.reportValidity();

				event.preventDefault();
				return;
			}
		}
	}

	$: paymentMethods = data.paymentMethods.filter((method) =>
		method === 'bitcoin' ? partialSatoshi >= 10_000 : true
	);

	let paymentMethod: (typeof paymentMethods)[0] | undefined = undefined;
	$: paymentMethod = typedInclude(paymentMethods, paymentMethod)
		? paymentMethod
		: paymentMethods[0];

	$: items = data.cart || [];
	$: deliveryFees = computeDeliveryFees(UNDERLYING_CURRENCY, country, items, data.deliveryFees);

	$: isDigital = items.every((item) => !item.product.shipping);
	$: actualCountry = isDigital || data.vatSingleCountry ? data.vatCountry : country;
	$: actualVatRate = isDigital || data.vatSingleCountry ? data.vatRate : vatRate(actualCountry);

	$: partialPrice =
		sumCurrency(
			UNDERLYING_CURRENCY,
			items.map((item) => ({
				currency: (item.customPrice || item.product.price).currency,
				amount:
					((item.customPrice || item.product.price).amount *
						item.quantity *
						(item.depositPercentage ?? 100)) /
					100
			}))
		) + (deliveryFees || 0);
	$: totalPrice =
		sumCurrency(
			UNDERLYING_CURRENCY,
			items.map((item) => ({
				currency: (item.customPrice || item.product.price).currency,
				amount: (item.customPrice || item.product.price).amount * item.quantity
			}))
		) + (deliveryFees || 0);
	$: totalPriceWithVat =
		totalPrice + fixCurrencyRounding(totalPrice * (actualVatRate / 100), UNDERLYING_CURRENCY);

	$: partialVat = fixCurrencyRounding(partialPrice * (actualVatRate / 100), UNDERLYING_CURRENCY);
	$: partialPriceWithVat = partialPrice + partialVat;
	$: partialSatoshi = toCurrency('SAT', partialPriceWithVat, UNDERLYING_CURRENCY);
	$: isDiscountValid =
		(discountType === 'fiat' &&
			totalPriceWithVat > toSatoshis(discountAmount, data.currencies.main)) ||
		(discountType === 'percentage' && discountAmount < 100);
	let showBillingInfo = false;
</script>

<main class="mx-auto max-w-7xl py-10 px-6 body-mainPlan">
	<div
		class="w-full rounded-xl body-mainPlan border-gray-300 p-6 md:grid gap-4 md:gap-2 flex md:grid-cols-3 sm:flex-wrap"
	>
		<form id="checkout" method="post" class="col-span-2 flex gap-4 flex-col" on:submit={checkForm}>
			<h1 class="page-title body-title">{t('checkout.title')}</h1>

			<section class="gap-4 grid grid-cols-6 w-4/5">
				<h2 class="font-light text-2xl col-span-6">{t('checkout.shipmentInfo')}</h2>

				{#if isDigital}
					<p class="col-span-6">
						{t('checkout.digitalNoShippingNeeded')}
					</p>
				{:else}
					<label class="form-label col-span-3">
						{t('address.firstName')}
						<input
							type="text"
							class="form-input"
							name="shipping.firstName"
							autocomplete="given-name"
							required
							value={data.personalInfoConnected?.firstName ?? ''}
						/>
					</label>

					<label class="form-label col-span-3">
						{t('address.lastName')}
						<input
							type="text"
							class="form-input"
							name="shipping.lastName"
							autocomplete="family-name"
							required
							value={data.personalInfoConnected?.lastName ?? ''}
						/>
					</label>

					<label class="form-label col-span-6">
						{t('address.address')}
						<input
							type="text"
							class="form-input"
							autocomplete="street-address"
							name="shipping.address"
							required
							value={data.personalInfoConnected?.address?.street ?? ''}
						/>
					</label>

					<label class="form-label col-span-3">
						{t('address.country')}
						<select name="shipping.country" class="form-input" required bind:value={country}>
							{#each sortedCountryCodes() as code}
								<option value={code}>{countryName(code)}</option>
							{/each}
						</select>
					</label>

					<span class="col-span-3" />

					<label class="form-label col-span-2">
						{t('address.state')}

						<input
							type="text"
							name="shipping.state"
							class="form-input"
							value={data.personalInfoConnected?.address?.state ?? ''}
						/>
					</label>
					<label class="form-label col-span-2">
						{t('address.city')}

						<input
							type="text"
							name="shipping.city"
							class="form-input"
							value={data.personalInfoConnected?.address?.city ?? ''}
							required
						/>
					</label>
					<label class="form-label col-span-2">
						{t('address.zipCode')}

						<input
							type="text"
							name="shipping.zip"
							class="form-input"
							value={data.personalInfoConnected?.address?.zip ?? ''}
							required
							autocomplete="postal-code"
						/>
					</label>

					<label class="col-span-6 checkbox-label">
						<input
							type="checkbox"
							class="form-checkbox"
							form="checkout"
							bind:checked={showBillingInfo}
						/>
						{t('checkout.differentBillingAddress')}
					</label>
				{/if}
			</section>

			{#if showBillingInfo || (isDigital && data.isBillingAddressMandatory)}
				<section class="gap-4 grid grid-cols-6 w-4/5">
					<h2 class="font-light text-2xl col-span-6">{t('checkout.billingInfo')}</h2>

					<label class="form-label col-span-3">
						{t('address.firstName')}
						<input
							type="text"
							class="form-input"
							name="billing.firstName"
							autocomplete="given-name"
							value={data.personalInfoConnected?.firstName ?? ''}
							required
						/>
					</label>

					<label class="form-label col-span-3">
						{t('address.lastName')}
						<input
							type="text"
							class="form-input"
							name="billing.lastName"
							autocomplete="family-name"
							value={data.personalInfoConnected?.lastName ?? ''}
							required
						/>
					</label>

					<label class="form-label col-span-6">
						{t('address.address')}
						<input
							type="text"
							class="form-input"
							autocomplete="street-address"
							name="billing.address"
							value={data.personalInfoConnected.address?.street ?? ''}
							required
						/>
					</label>

					<label class="form-label col-span-3">
						{t('address.country')}
						<select name="billing.country" class="form-input" required value={defaultCountry}>
							{#each sortedCountryCodes() as code}
								<option value={code}>{countryName(code)}</option>
							{/each}
						</select>
					</label>

					<span class="col-span-3" />

					<label class="form-label col-span-2">
						{t('address.state')}

						<input
							type="text"
							name="billing.state"
							class="form-input"
							value={data.personalInfoConnected.address?.state ?? ''}
						/>
					</label>
					<label class="form-label col-span-2">
						{t('address.city')}

						<input
							type="text"
							name="billing.city"
							class="form-input"
							value={data.personalInfoConnected.address?.city ?? ''}
							required
						/>
					</label>
					<label class="form-label col-span-2">
						{t('address.zipCode')}

						<input
							type="text"
							name="billing.zip"
							class="form-input"
							value={data.personalInfoConnected.address?.zip ?? ''}
							required
							autocomplete="postal-code"
						/>
					</label>
				</section>
			{/if}

			<section class="gap-4 flex flex-col">
				<h2 class="font-light text-2xl">{t('checkout.payment.title')}</h2>

				<label class="form-label">
					{t('checkout.payment.method')}

					<div class="grid grid-cols-2 gap-4 items-center">
						<select
							name="paymentMethod"
							class="form-input"
							bind:value={paymentMethod}
							disabled={paymentMethods.length === 0}
							required
						>
							{#each paymentMethods as paymentMethod}
								<option value={paymentMethod}>{t('checkout.paymentMethod.' + paymentMethod)}</option
								>
							{/each}
						</select>
						{#if paymentMethods.length === 0}
							<p class="text-red-400">{t('checkout.paymentMethod.unavailable')}</p>
						{/if}
						{#if 0}
							<a href="/connect" class="underline body-hyperlink"> Connect another wallet </a>
						{/if}
					</div>
				</label>
			</section>

			<section class="gap-4 flex flex-col">
				<h2 class="font-light text-2xl">{t('checkout.notifications.title')}</h2>

				{#each feedItems as { key, label }}
					<article class="rounded border border-gray-300 overflow-hidden flex flex-col">
						<div class="pl-4 py-2 body-mainPlan border-b border-gray-300 text-base font-light">
							{label}
						</div>
						<div class="p-4 flex flex-col gap-3">
							<label class="form-label">
								{t('checkout.notifications.npub')}
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
									{t('checkout.notifications.email')}
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
					<a href="/cart" class="body-hyperlink hover:underline"
						>&lt;&lt;{t('checkout.backToCart')}</a
					>
					<p>{t('checkout.numProducts', { count: data.cart?.length ?? 0 })}</p>
				</div>
				{#each items as item}
					{@const price = item.customPrice || item.product.price}
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
						{#if item.depositPercentage ?? undefined !== undefined}
							<input type="hidden" name="depositPercentage" value={item.depositPercentage} />
						{/if}
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
										class="mx-auto rounded h-full object-contain"
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
										depositPercentage={item.depositPercentage}
									/>
								</div>
								<div>
									{#if 0}
										<CartQuantity {item} sm />
									{:else if item.quantity > 1}
										{t('cart.quantity')}: {item.quantity}
									{/if}
								</div>
							</div>

							<div class="flex flex-col ml-auto items-end justify-center">
								<PriceTag
									class="text-2xl truncate"
									amount={(item.quantity * price.amount * (item.depositPercentage ?? 100)) / 100}
									currency={price.currency}
									main
									>{item.depositPercentage
										? `(${(item.depositPercentage / 100).toLocaleString($locale, {
												style: 'percent'
										  })})`
										: ''}</PriceTag
								>
								<PriceTag
									amount={(item.quantity * price.amount * (item.depositPercentage ?? 100)) / 100}
									currency={price.currency}
									class="text-base truncate"
									secondary
								/>
							</div>
						</div>
					</form>

					<div class="border-b border-gray-300 col-span-4" />
				{/each}

				{#if deliveryFees}
					<div class="flex justify-between items-center">
						<h3 class="text-base">{t('checkout.deliveryFees')}</h3>

						<div class="flex flex-col ml-auto items-end justify-center">
							<PriceTag
								class="text-2xl truncate"
								amount={deliveryFees}
								currency={UNDERLYING_CURRENCY}
								main
							/>
							<PriceTag
								amount={deliveryFees}
								currency={UNDERLYING_CURRENCY}
								class="text-base truncate"
								secondary
							/>
						</div>
					</div>
					<div class="border-b border-gray-300 col-span-4" />
				{:else if isNaN(deliveryFees)}
					<div class="alert-error mt-3">
						{t('checkout.noDeliveryInCountry')}
					</div>
				{/if}

				{#if data.vatCountry && !data.vatExempted}
					<div class="flex justify-between items-center">
						<div class="flex flex-col">
							<h3 class="text-base flex flex-row gap-2 items-center">
								{t('cart.vat')} ({actualVatRate}%)
								<div
									title="{t('cart.vatRate', {
										country: countryName(actualCountry)
									})}. {data.vatSingleCountry
										? t('cart.vatSellerCountry')
										: isDigital
										? `${t('cart.vatIpCountryText', { link: 'https://lite.ip2location.com' })}`
										: t('checkout.vatShippingAddress')}"
								>
									<IconInfo class="cursor-pointer" />
								</div>
							</h3>
						</div>

						<div class="flex flex-col ml-auto items-end justify-center">
							<PriceTag
								class="text-2xl truncate"
								amount={partialVat}
								currency={UNDERLYING_CURRENCY}
								main
							/>
							<PriceTag
								amount={partialVat}
								currency={UNDERLYING_CURRENCY}
								class="text-base truncate"
								secondary
							/>
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
							amount={partialPriceWithVat}
							currency={UNDERLYING_CURRENCY}
							main
						/>
					</div>
					<PriceTag
						class="self-end"
						amount={partialPriceWithVat}
						currency={UNDERLYING_CURRENCY}
						secondary
					/>
				</div>

				{#if totalPriceWithVat !== partialPriceWithVat}
					<div class="-mx-3 p-3 flex flex-col">
						<div class="flex justify-between">
							<span class="text-xl flex gap-1 items-center flex-wrap"
								>{t('cart.remaining')}<span title={t('cart.remainingHelpText')}>
									<IconInfo class="cursor-pointer" />
								</span></span
							>
							<PriceTag
								class="text-2xl"
								amount={partialPriceWithVat}
								currency={UNDERLYING_CURRENCY}
								main
							/>
						</div>
						<PriceTag
							class="self-end"
							amount={partialPriceWithVat}
							currency={UNDERLYING_CURRENCY}
							secondary
						/>
					</div>
				{/if}

				<label class="checkbox-label">
					<input type="checkbox" class="form-checkbox" name="teecees" form="checkout" required />
					<span>
						<Trans key="checkout.tosAgree"
							><a
								href="/terms"
								target="_blank"
								class="body-hyperlink hover:underline"
								slot="0"
								let:translation
							>
								{translation}
							</a></Trans
						>
					</span>
				</label>

				{#if data.roleId === POS_ROLE_ID}
					<label class="checkbox-label">
						<input
							type="checkbox"
							class="form-checkbox"
							bind:checked={isFreeVat}
							name="isFreeVat"
							form="checkout"
						/>
						<span>
							<Trans key="pos.vatFree"
								><a
									href="/terms"
									target="_blank"
									class="body-hyperlink hover:underline"
									slot="0"
									let:translation
								>
									{translation}
								</a></Trans
							>
						</span>
					</label>
					<label class="checkbox-label">
						<input
							type="checkbox"
							class="form-checkbox"
							bind:checked={addDiscount}
							name="addDiscount"
							form="checkout"
						/>
						<span>
							<Trans key="pos.applyGiftDiscount">
								<a
									href="/gift-discount"
									target="_blank"
									class="body-hyperlink hover:underline"
									slot="0"
									let:translation
								>
									{translation}
								</a>
							</Trans>
						</span>
					</label>
				{/if}

				{#if isFreeVat}
					<label class="form-label col-span-3">
						{t('pos.vatFreeReason')}:
						<input type="text" class="form-input" form="checkout" name="reasonFreeVat" />
					</label>
				{/if}
				{#if addDiscount}
					<input
						type="number"
						class="form-input"
						name="discountAmount"
						placeholder="Ex: 10"
						form="checkout"
						step="any"
						bind:value={discountAmount}
						min="0"
						required
					/>

					<select
						name="discountType"
						bind:value={discountType}
						class="form-input"
						form="checkout"
						required
					>
						<option value="fiat">{data.currencies.main}</option>
						<option value="percentage">%</option>
					</select>

					{#if discountAmount && !isDiscountValid}
						<p class="text-sm text-red-600">{t('pos.invalidDiscount')}</p>
					{/if}

					<label class="form-label col-span-3">
						{t('pos.discountJustification')}
						<input type="text" class="form-input" form="checkout" name="discountJustification" />
					</label>
				{/if}

				{#if data.collectIPOnDeliverylessOrders && isDigital}
					<label class="checkbox-label">
						<input
							type="checkbox"
							class="form-checkbox"
							name="allowCollectIP"
							form="checkout"
							required
						/>
						<span>
							<Trans key="checkout.agreeIpCollect"
								><a
									href="/why-collect-ip"
									target="_blank"
									class="body-hyperlink hover:underline"
									slot="0"
									let:translation>{translation}</a
								></Trans
							>
						</span>
					</label>
				{/if}
				{#if totalPriceWithVat !== partialPriceWithVat}
					<label class="checkbox-label">
						<input
							type="checkbox"
							class="form-checkbox"
							name="isOnlyDeposit"
							form="checkout"
							required
						/>
						<span>
							<Trans key="checkout.agreeOnlyDeposit"
								><a
									href="/why-pay-remainder"
									target="_blank"
									class="body-hyperlink hover:underline"
									slot="0"
									let:translation>{translation}</a
								></Trans
							>
						</span>
					</label>
				{/if}

				<input
					type="submit"
					class="btn body-cta body-mainCTA btn-xl -mx-1 -mb-1 mt-1"
					value={t('checkout.cta.submit')}
					form="checkout"
					disabled={isNaN(deliveryFees) || (addDiscount && !isDiscountValid)}
				/>
			</article>
		</div>
	</div>
</main>
