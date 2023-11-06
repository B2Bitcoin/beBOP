<script lang="ts">
	import { page } from '$app/stores';
	import { marked } from 'marked';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { applyAction, enhance } from '$app/forms';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';
	import GoalProgress from '$lib/components/GoalProgress.svelte';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import { invalidate } from '$app/navigation';
	import { UrlDependency } from '$lib/types/UrlDependency';
	import {
		DEFAULT_MAX_QUANTITY_PER_ORDER,
		isPreorder as isPreorderFn,
		oneMaxPerLine
	} from '$lib/types/Product';
	import { toCurrency } from '$lib/utils/toCurrency';
	import { differenceInHours } from 'date-fns';
	import { POS_ROLE_ID } from '$lib/types/User.js';

	export let data;

	let quantity = 1;
	let loading = false;
	let errorMessage = '';
	const endsAt = data.discount ? new Date(data.discount.endsAt).getTime() : Date.now(); // Convert to timestamp
	const currentTime = Date.now();
	const hoursDifference = differenceInHours(endsAt, currentTime);
	let customAmount =
		data.product.price.amount !== 0 &&
		toCurrency(data.currencies.main, data.product.price.amount, data.product.price.currency) < 0.01
			? 0.01
			: toCurrency(data.currencies.main, data.product.price.amount, data.product.price.currency);

	$: currentPicture =
		data.pictures.find((picture) => picture._id === $page.url.searchParams.get('picture')) ??
		data.pictures[0];

	$: isPreorder = isPreorderFn(data.product.availableDate, data.product.preorder);

	$: amountAvailable = Math.max(
		Math.min(
			data.product.stock?.available ?? Infinity,
			data.product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER
		),
		0
	);

	$: canBuy =
		data.roleId === POS_ROLE_ID
			? data.product.actionSettings.retail.canBeAddedToBasket
			: data.product.actionSettings.eShop.canBeAddedToBasket;

	function addToCart() {
		$productAddedToCart = {
			product: data.product,
			quantity,
			...(data.product.type !== 'subscription' && {
				customPrice: { amount: customAmount, currency: data.currencies.main }
			}),
			picture: currentPicture
		};
	}
</script>

<svelte:head>
	<title>{data.product.name}</title>
	{#if data.product.shortDescription}
		<meta name="description" content={data.product.shortDescription} />
		<meta property="og:description" content={data.product.shortDescription} />
	{/if}
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
	<meta property="og:type" content="og:product" />
	<meta property="og:title" content={data.product.name} />
	{#if currentPicture}
		<meta
			property="og:image"
			content="{$page.url.origin}/picture/raw/{currentPicture._id}/format/{currentPicture.storage
				.formats[0].width}"
		/>
	{/if}
	<meta property="product:price:amount" content={String(data.product.price.amount)} />
	<meta property="product:price:currency" content={data.product.price.currency} />
	<meta property="og:type" content="og:product" />
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border py-3 px-3 flex gap-2">
		<div class="flex flex-col gap-2 w-14 min-w-[48px] py-12 hidden md:block">
			{#if data.pictures.length > 1}
				{#each data.pictures as picture, i}
					<a href={i === 0 ? $page.url.pathname : '?picture=' + picture._id}>
						<Picture
							{picture}
							class="h-12 w-12 rounded-sm m-2 {picture === currentPicture
								? 'ring-2 ring-link ring-offset-2'
								: ''} cursor-pointer"
						/>
					</a>
				{/each}
			{/if}
		</div>

		<div class="flex flex-col md:grid md:grid-cols-[70%_1fr] gap-2 grow pb-12">
			<div class="flex flex-col gap-4">
				<!-- add product name -->
				<h2 class="text-4xl">{data.product.name}</h2>
				<!-- Getting this right with rounded borders on both chrome & FF is painful, chrome NEEDs overflow-hidden -->
				<div class="aspect-video w-full overflow-hidden">
					<Picture
						picture={currentPicture}
						class="mx-auto rounded h-full object-contain"
						sizes="(min-width: 1280px) 896px, 70vw"
					/>
				</div>
				<div class="flex flex-row gap-2 h-12 min-w-[96px] sm:inline md:hidden py-12">
					{#if data.pictures.length > 1}
						{#each data.pictures as picture, i}
							<a href={i === 0 ? $page.url.pathname : '?picture=' + picture._id}>
								<Picture
									{picture}
									class="h-12 w-12 rounded-sm {picture === currentPicture
										? 'ring-2 ring-link ring-offset-2'
										: ''} cursor-pointer"
								/>
							</a>
						{/each}
					{/if}
				</div>
				{#if data.product.description.trim() || data.product.shortDescription.trim()}
					<hr class="border-gray-300" />
					<h2 class="text-gray-850 text-[22px]">
						{data.product.displayShortDescription && data.product.shortDescription
							? data.product.shortDescription
							: 'Description'}
					</h2>
					<p class="text-gray-800 prose">
						{@html marked(data.product.description.replaceAll('<', '&lt;'))}
					</p>
				{/if}
				{#if 0}
					<hr class="border-gray-300" />
					<h2 class="text-gray-850 text-[22px]">This product is part of a challenge</h2>
					<p class="text-gray-800">
						By purchasing this product, 20% of its price will go to the funds of the next
						crowdfunding:
					</p>
					<div class="bg-gray-75 border-gray-300 border rounded p-4 flex flex-col">
						<div class="flex justify-between items-center">
							<h3 class="font-medium text-[22px] text-gray-850">
								WACOM CINTIQ 24" for an emerging artist.
							</h3>
							<span class="text-base font-light text-gray-550">Ends April 25</span>
						</div>
						<GoalProgress
							class="font-bold mt-3"
							text="{Number(7).toLocaleString('en', {
								style: 'currency',
								currency: 'EUR',
								minimumFractionDigits: 0
							})} 🙂"
							goal={600}
							progress={422}
						/>
						<div class="flex justify-between mt-1 items-center">
							<a href="/" class="text-link underline">How can I contribute?</a>
							<PriceTag amount={600} class="text-gray-800 text-base" currency="EUR" />
						</div>
					</div>
				{/if}
			</div>
			<div
				class="flex flex-col text-gray-850 gap-2 border-gray-300 md:border-l md:border-b md:rounded md:pl-4 md:pb-4 h-fit overflow-hidden"
			>
				<hr class="border-gray-300 md:hidden mt-4 pb-2" />
				<div class="flex gap-2 md:flex-col md:items-start items-center justify-between">
					<PriceTag
						currency={data.product.price.currency}
						class="text-2xl md:text-4xl truncate max-w-full"
						short={false}
						amount={data.product.price.amount}
						main
					/>
					<PriceTag
						currency={data.product.price.currency}
						amount={data.product.price.amount}
						secondary
						class="text-xl"
					/>
				</div>

				{#if data.discount}
					<hr class="border-gray-300" />
					<h3 class="text-gray-850 text-[22px]">
						{data.discount.percentage}% off for {hoursDifference}h
					</h3>
					{#if 0}
						<GoalProgress text="1h32min left" goal={600} progress={444} />
					{/if}
					{#if data.discount.percentage === 100}
						<hr class="border-gray-300" />
						<div class="border border-[#F1DA63] bg-[#FFFBD5] p-2 rounded text-base flex gap-2">
							<IconInfo class="text-[#E4C315]" />
							<div>
								<h3 class="font-semibold text-gray-800">Free with "xxxxx"</h3>
								<p class="text-gray-700">
									This product is available for free with your monthly subscription
								</p>
								<a href="/cabinet" class="text-[#E4C315] hover:underline">See in MyCabinet</a>
							</div>
						</div>
					{/if}
				{/if}
				<hr class="border-gray-300 my-2" />

				{#if isPreorder && data.product.availableDate}
					<p>
						This is a preorder, your product will be available on
						{new Date(data.product.availableDate).toLocaleDateString('en', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
				{/if}
				{#if !data.product.availableDate || data.product.availableDate <= new Date() || isPreorder}
					{@const verb = isPreorder
						? 'Preorder'
						: data.product.type === 'donation'
						? 'Donate'
						: data.product.type === 'subscription'
						? 'Subscribe'
						: 'Buy'}
					<form
						action="?/buy"
						method="post"
						use:enhance={({ action }) => {
							loading = true;
							errorMessage = '';
							return async ({ result }) => {
								loading = false;

								if (result.type === 'error') {
									errorMessage = result.error.message;
									return;
								}

								if (!action.searchParams.has('/addToCart')) {
									return await applyAction(result);
								}

								await invalidate(UrlDependency.Cart);
								addToCart();
								document.body.scrollIntoView();
							};
						}}
						class="flex flex-col gap-2"
					>
						{#if canBuy}
							{#if data.product.payWhatYouWant}
								<hr class="border-gray-300 md:hidden mt-4 pb-2" />
								<div class="flex flex-col gap-2 justify-between">
									<label class="w-full form-label">
										Name your price ({data.currencies.main}):
										<input
											class="form-input"
											type="number"
											min={customAmount < 0.01 && data.product.price.amount !== 0
												? '0.01'
												: toCurrency(
														data.currencies.main,
														data.product.price.amount,
														data.product.price.currency
												  )}
											name="customPrice"
											bind:value={customAmount}
											placeholder="Price"
											required
											step="any"
										/>
									</label>
								</div>
							{/if}
							{#if !oneMaxPerLine(data.product) && amountAvailable > 0}
								<label class="mb-2">
									Amount: <select
										name="quantity"
										bind:value={quantity}
										class="form-input w-16 ml-2 inline cursor-pointer"
									>
										{#each Array(amountAvailable)
											.fill(0)
											.map((_, i) => i + 1) as i}
											<option value={i}>{i}</option>
										{/each}
									</select>
								</label>
							{/if}
							{#if errorMessage}
								<p class="text-red-500">{errorMessage}</p>
							{/if}
							{#if amountAvailable === 0}
								<p class="text-red-500">
									<span class="font-bold">Out of stock</span>
									<br />
									Please check back later
								</p>
							{:else if data.showCheckoutButton}
								<button class="btn btn-black" disabled={loading}>{verb} now</button>
								<button
									value="Add to cart"
									formaction="?/addToCart"
									disabled={loading}
									class="btn btn-gray"
								>
									Add to cart
								</button>
							{:else}
								<button
									value="Add to cart"
									formaction="?/addToCart"
									disabled={loading}
									class="btn btn-black"
								>
									{verb}
								</button>
							{/if}
						{:else}
							<p>This product is not available for sale</p>
						{/if}
					</form>
				{:else}
					<p>
						Available on
						{new Date(data.product.availableDate).toLocaleDateString('en', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
				{/if}
			</div>
		</div>
	</article>
</main>
