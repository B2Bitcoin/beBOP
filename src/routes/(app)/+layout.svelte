<script>
	import IconDownArrow from '$lib/components/icons/IconDownArrow.svelte';
	import IconSearch from '$lib/components/icons/IconSearch.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import IconBasket from '$lib/components/icons/IconBasket.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate, goto, invalidate } from '$app/navigation';
	import { navigating, page } from '$app/stores';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import ProductAddedToCart from '$lib/components/ProductAddedToCart.svelte';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import { sum } from '$lib/utils/sum';
	import Popup from '$lib/components/Popup.svelte';
	import { applyAction, enhance } from '$app/forms';
	import Picture from '$lib/components/Picture.svelte';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import IconTrash from '$lib/components/icons/IconTrash.svelte';
	import DEFAULT_LOGO from '$lib/assets/bebop-light.svg';
	import DEFAULT_LOGO_DARK from '$lib/assets/bebop-dark.svg';

	//import IconMenu from '~icons/ant-design/holder-outlined';
	import IconMenu from '~icons/ant-design/menu-outlined';
	import { slide } from 'svelte/transition';
	import { exchangeRate } from '$lib/stores/exchangeRate';
	import { currencies } from '$lib/stores/currencies';
	import { sumCurrency } from '$lib/utils/sumCurrency';
	import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding';
	import { useI18n } from '$lib/i18n';
	import IconModeLight from '$lib/components/icons/IconModeLight.svelte';
	import IconModeDark from '$lib/components/icons/IconModeDark.svelte';
	import theme from '$lib/stores/theme';
	import { upperCase } from 'lodash-es';
	import { UNDERLYING_CURRENCY } from '$lib/types/Currency';

	export let data;

	let topMenuOpen = false;
	let navMenuOpen = false;

	let cartErrorMessage = '';
	let cartErrorProductId = '';

	let actionCount = 0;

	$exchangeRate = data.exchangeRate;
	$currencies = data.currencies;

	$: $exchangeRate = data.exchangeRate;
	$: $currencies = data.currencies;

	$: items = data.cart || [];
	$: partialPrice = sumCurrency(
		UNDERLYING_CURRENCY,
		items.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount:
				((item.customPrice || item.product.price).amount *
					item.quantity *
					(item.depositPercentage ?? 100)) /
				100
		}))
	);
	$: totalPrice = sumCurrency(
		UNDERLYING_CURRENCY,
		items.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount: (item.customPrice || item.product.price).amount * item.quantity
		}))
	);
	$: partialVat = fixCurrencyRounding(partialPrice * (data.vatRate / 100), UNDERLYING_CURRENCY);
	$: totalPriceWithVat =
		totalPrice + fixCurrencyRounding(totalPrice * (data.vatRate / 100), UNDERLYING_CURRENCY);
	$: partialPriceWithVat = partialPrice + partialVat;
	$: totalItems = sum(items.map((item) => item.quantity) ?? []);

	onMount(() => {
		// Refresh exchange rate every 5 minutes
		const interval = setInterval(
			() =>
				fetch('/exchange-rate', {
					headers: {
						Accept: 'application/json'
					}
				})
					.then((r) => {
						if (!r.ok) {
							throw new Error('Error when fetching exchange rate: ' + r.status);
						}
						return r.json();
					})
					.then((val) => {
						$exchangeRate = val;
					}),
			5 * 60_000
		);

		return () => clearInterval(interval);
	});

	let cartOpen = false;

	$: if ($navigating) {
		topMenuOpen = false;
		navMenuOpen = false;
		$productAddedToCart = null;
	}

	afterNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) {
			cartOpen = false;
		}
	});

	$: if (items.length === 0) {
		cartOpen = false;
	}

	$: logoClass = data.logo.isWide ? 'h-[60px] w-auto' : 'h-[60px] w-[60px] rounded-full';
	const { t, locale, textAddress } = useI18n();
</script>

<!--
	We use data-sveltekit-preload-data="off" on header/footer links due to this: 	https://github.com/sveltejs/kit/issues/9508#issuecomment-1807200239
-->

<div data-sveltekit-preload-data={data.isMaintenance ? 'tap' : 'hover'} style="display: contents;">
	{#if $page.data.layoutReset}
		<slot />
	{:else}
		<header class="header items-center flex h-[100px]">
			<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 text-white grow">
				<a class="flex items-center gap-4" href="/">
					{#if data.logoPicture}
						<Picture class="dark:hidden {logoClass}" picture={data.logoPicture} />
						<Picture
							class="hidden dark:inline {logoClass}"
							picture={data.logoPictureDark || data.logoPicture}
						/>
					{:else}
						<img class="hidden dark:inline {logoClass}" src={DEFAULT_LOGO} alt="" />
						<img class="dark:hidden {logoClass}" src={DEFAULT_LOGO_DARK} alt="" />
					{/if}
					{#if !data.logo.isWide}
						<span class="header-shopName font-bold text-[32px]">{data.brandName}</span>
					{/if}
				</a>
				<span class="grow body-mainPlan" />
				<nav class="flex gap-10 text-[22px] font-semibold header-tab">
					{#each data.links.topbar as link}
						<a href={link.href} class="hidden sm:inline" data-sveltekit-preload-data="off">
							{link.label}
						</a>
					{/each}
				</nav>
				{#if 0}
					<div class="border-r-[1px] border-gray-700 h-8 border-solid" />
					<a href="/admin" class="btn btn-blue font-bold">Connect your wallet</a>
				{/if}
				<button
					class="inline-flex flex-col justify-center sm:hidden cursor-pointer text-4xl transition"
					class:rotate-90={topMenuOpen}
					on:click={() => (topMenuOpen = !topMenuOpen)}
				>
					<IconMenu />
				</button>
			</div>
		</header>
		{#if topMenuOpen}
			<nav
				transition:slide
				class="header-tab flex flex-col sm:hidden text-[22px] font-semibold border-x-0 border-b-0 border-opacity-25 border-t-1 border-white px-10 py-4 text-white"
			>
				{#each data.links.topbar as link}
					<a class="py-4" href={link.href} data-sveltekit-preload-data="off">{link.label}</a>
				{/each}
			</nav>
		{/if}
		<header class="navbar h-[66px] items-center flex">
			<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 grow">
				<nav class="flex gap-6 font-light items-center">
					<button
						class="inline-flex flex-col justify-center sm:hidden cursor-pointer text-2xl transition"
						class:rotate-90={navMenuOpen}
						on:click={() => (navMenuOpen = !navMenuOpen)}
					>
						<IconMenu />
					</button>
					{#if 0}
						<a href="/categories" class="flex gap-2 items-center">Categories <IconDownArrow /></a>
					{/if}
					{#each data.links.navbar as link}
						<a href={link.href} class="hidden sm:inline" data-sveltekit-preload-data="off"
							>{link.label}</a
						>
					{/each}
				</nav>
				{#if 0}
					<form action="/search" method="post" class="max-w-[520px] grow relative">
						<input type="text" name="search" class="form-input pr-8 border-gray-300" />
						<IconSearch class="absolute right-2 top-0 bottom-0 my-auto" />
					</form>
				{/if}
				<div class="flex items-center ml-auto gap-2">
					{#if 0}
						<IconWallet />
						<div class="flex flex-col">
							<PriceTag gap={'gap-1'} currency="BTC" amount={0.00_220_625} main />
							<PriceTag
								gap={'gap-1'}
								currency="BTC"
								amount={0.00_220_625}
								secondary
								class="ml-auto text-sm"
							/>
						</div>
						<div class="border-r-[1px] mx-1 border-gray-800 h-10 border-solid" />
					{/if}
					<div class="flex flex-row relative">
						<a
							href="/cart"
							on:click={(ev) => {
								if (!items.length || $page.url.pathname === '/checkout') {
									return;
								}
								cartOpen = !cartOpen;
								ev.preventDefault();
							}}
							class="flex gap-2 items-center"
						>
							<IconBasket />
							{totalItems}
						</a>
						{#if $productAddedToCart && !$productAddedToCart.widget}
							<Popup>
								<ProductAddedToCart
									class="w-[562px] max-w-full"
									on:dismiss={() => ($productAddedToCart = null)}
									product={$productAddedToCart.product}
									picture={$productAddedToCart.picture}
									customPrice={$productAddedToCart.customPrice}
									depositPercentage={$productAddedToCart.depositPercentage}
								/>
							</Popup>
						{:else if cartOpen}
							<Popup>
								<div class="p-2 gap-2 flex flex-col cartPreview">
									{#each items as item}
										{@const price = item.customPrice ?? item.product.price}

										{#if cartErrorMessage && cartErrorProductId === item.product._id}
											<div class="text-red-600 text-sm">{cartErrorMessage}</div>
										{/if}
										<form
											class="flex border-b border-gray-300 pb-2 gap-2"
											method="POST"
											use:enhance={({ action }) => {
												cartErrorMessage = '';
												if (action.searchParams.has('/increase')) {
													item.quantity++;
												} else if (action.searchParams.has('/decrease')) {
													item.quantity--;
												} else if (action.searchParams.has('/remove')) {
													item.quantity = 0;
												}
												actionCount++;
												let currentCount = actionCount;

												return async ({ result }) => {
													if (actionCount === currentCount) {
														if (result.type === 'redirect') {
															// Invalidate all to remove 0-quantity items
															await goto(result.location, {
																noScroll: true,
																invalidateAll: true
															});
															return;
														}
														if (result.type === 'error' && result.error?.message) {
															cartErrorMessage = result.error.message;
															cartErrorProductId = item.product._id;
															await invalidate(UrlDependency.Cart);
															return;
														}
														await applyAction(result);
													}
												};
											}}
										>
											{#if item.depositPercentage ?? undefined !== undefined}
												<input
													type="hidden"
													name="depositPercentage"
													value={item.depositPercentage}
												/>
											{/if}
											<a
												href="/product/{item.product._id}"
												class="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded flex items-center"
											>
												{#if item.picture}
													<Picture
														picture={item.picture}
														class="mx-auto rounded h-full object-contain"
														sizes="44px"
													/>
												{/if}
											</a>
											<div class="flex flex-col">
												<a href="/product/{item.product._id}">
													<h3 class="text-base font-medium">{item.product.name}</h3>
												</a>
												{#if item.product.type !== 'subscription' && !item.product.standalone}
													<div class="flex items-center gap-2">
														<span class="text-xs">{t('cart.quantity')}: </span>
														<CartQuantity {item} sm />
													</div>
												{/if}
											</div>
											<div class="flex flex-col items-end gap-[6px] ml-auto">
												<PriceTag
													class="text-base"
													amount={(item.quantity * price.amount * (item.depositPercentage ?? 100)) /
														100}
													currency={price.currency}
													main
													>{item.depositPercentage
														? `(${(item.depositPercentage / 100).toLocaleString($locale, {
																style: 'percent'
														  })})`
														: ''}</PriceTag
												>

												<button formaction="/cart/{item.product._id}/?/remove">
													<IconTrash class="body-secondaryText" />
													<span class="sr-only">{t('cart.sr.remove')}</span>
												</button>
											</div>
										</form>
									{/each}
									{#if data.vatCountry !== data.countryCode && data.vatNullOutsideSellerCountry}
										<div class="flex gap-1 text-lg justify-end items-center">
											{t('product.vatExcluded')}
										</div>
									{:else if data.countryCode && !data.vatExempted}
										<div class="flex gap-1 text-lg justify-end items-center">
											{t('cart.vat')} ({data.vatRate}%) <PriceTag
												currency={UNDERLYING_CURRENCY}
												amount={partialVat}
												main
											/>
										</div>
									{/if}
									<div class="flex gap-1 text-xl justify-end items-center">
										{t('cart.total')}
										<PriceTag currency={UNDERLYING_CURRENCY} amount={partialPriceWithVat} main />
									</div>
									{#if totalPriceWithVat !== partialPriceWithVat}
										<div class="flex gap-1 text-lg justify-end items-center">
											{t('cart.remainingShort')}
											<PriceTag
												currency={UNDERLYING_CURRENCY}
												amount={totalPriceWithVat - partialPriceWithVat}
												main
											/>
										</div>
									{/if}
									<a href="/cart" class="btn cartPreview-mainCTA mt-1 whitespace-nowrap">
										{t('cart.cta.view')}
									</a>
									<a href="/checkout" class="btn cartPreview-secondaryCTA">
										{t('cart.cta.checkout')}
									</a>
								</div>
							</Popup>
						{/if}
						<button
							class="ml-4 hidden dark:inline"
							type="button"
							on:click={() => {
								$theme = 'light';
								window.localStorage.setItem('theme', 'light');
							}}
						>
							<IconModeLight />
						</button>
						<button
							type="button"
							class="ml-4 dark:hidden"
							on:click={() => {
								$theme = 'dark';
								window.localStorage.setItem('theme', 'dark');
							}}
						>
							<IconModeDark />
						</button>
						<select
							class="ml-4 border-0 cursor-pointer rounded appearance-none bg-none bg-transparent text-xl"
							size="0"
							bind:value={$locale}
							on:change={() => {
								document.cookie = `lang=${$locale};path=/;max-age=31536000`;
								window.location.reload();
							}}
						>
							{#each data.locales as locale}
								<option style="background-color: var(--navbar-backgroundColor);" value={locale}>
									{locale}
								</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		</header>
		{#if navMenuOpen}
			<nav
				transition:slide
				class="bg-gray-240 font-light flex flex-col sm:hidden border-x-0 border-b-0 border-opacity-25 border-t-1 border-white px-4 pb-3"
			>
				{#each data.links.navbar as link}
					<a class="py-2 hover:underline" data-sveltekit-preload-data="off" href={link.href}
						>{link.label}</a
					>
				{/each}
			</nav>
		{/if}

		{#if $page.url.pathname.startsWith('/admin')}
			<div class="grow">
				<slot />
			</div>
		{:else if $page.url.pathname === '/pos'}
			<div class="grow">
				<slot />
			</div>
		{:else}
			<div class="grow body-mainPlan">
				<slot />
			</div>
		{/if}

		<footer class="footer h-auto items-center flex">
			<div
				class="mx-auto max-w-7xl px-6 py-6 flex items-start justify-between gap-2 gap-y-8 w-full flex-wrap"
			>
				{#if data.displayCompanyInfo && data.sellerIdentity}
					<!-- First column -->
					<div>
						<h3 class="text-lg font-semibold mb-2">{upperCase(t('footer.company.identity'))}</h3>
						<p class="whitespace-pre-line">
							{textAddress({
								firstName: data.sellerIdentity.businessName,
								lastName: '',
								address: data.sellerIdentity.address.street,
								zip: data.sellerIdentity.address.zip,
								city: data.sellerIdentity.address.city,
								country: data.sellerIdentity.address.country,
								state: data.sellerIdentity.address.state
							})}
						</p>
					</div>

					<!-- Second column -->
					{#if data.sellerIdentity.contact.email || data.sellerIdentity.contact.phone}
						<div>
							<h3 class="text-lg font-semibold mb-2">{upperCase(t('footer.company.contact'))}</h3>
							{#if data.sellerIdentity.contact.email}
								<a href="mailto:{data.sellerIdentity.contact.email}">
									{data.sellerIdentity.contact.email}
								</a>
							{/if}
							{#if data.sellerIdentity.contact.phone}
								<a href="tel:{data.sellerIdentity.contact.phone}">
									{data.sellerIdentity.contact.phone}
								</a>
							{/if}
						</div>
					{/if}
				{/if}

				<div class="flex flex-col gap-4 items-center">
					<div class="flex flex-row">
						{#each data.links.footer as link}
							<a href={link.href} data-sveltekit-preload-data="off">{link.label}</a>
						{/each}
					</div>
					<div class="flex flex-row">
						{#each data.links.socialNetworkIcons as icon}
							<a href={icon.href} data-sveltekit-preload-data="off" target="_blank"
								>{@html icon.svg}</a
							>
						{/each}
					</div>
				</div>

				{#if data.footerLogoId}
					<div class="flex w-full">
						<Picture class={logoClass} picture={data.footerPicture} />
					</div>
				{:else if data.displayPoweredBy}
					<div class="flex w-full">
						<a class="flex items-center gap-4" href="https://github.com/B2Bitcoin/beBOP"
							><span class="font-light">{t('footer.poweredBy')} </span>
							<img class="h-[40px] w-auto hidden dark:inline" src={DEFAULT_LOGO_DARK} alt="" />
							<img class="h-[40px] w-auto dark:hidden" src={DEFAULT_LOGO_DARK} alt="" />
						</a>
					</div>
				{/if}
			</div>
		</footer>
	{/if}
</div>
