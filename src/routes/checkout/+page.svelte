<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { COUNTRIES } from '$lib/types/Country';
	import { sum } from '$lib/utils/sum';
	import { bech32 } from 'bech32';
	import { typedValues } from '$lib/utils/typedValues';

	let actionCount = 0;
	export let data;

	const feedItems = [
		{ key: 'paymentStatus', label: 'Payment status' },
		{ key: 'productChanges', label: 'Product changes' },
		{ key: 'newsletter', label: 'Newsletter' }
	] as const;

	type FeedKey = (typeof feedItems)[number]['key'];

	const npubInputs: Record<FeedKey, HTMLInputElement | null> = {
		paymentStatus: null,
		productChanges: null,
		newsletter: null
	};

	function checkForm(event: SubmitEvent) {
		for (const input of typedValues(npubInputs)) {
			if (!input) continue;

			input.value = input.value.trim();

			if (
				input.value &&
				(!input.value.startsWith('npub1') || bech32.decodeUnsafe(input.value)?.prefix !== 'npub')
			) {
				input.setCustomValidity('Invalid NostR public address');
				input.reportValidity();

				event.preventDefault();
				return;
			} else {
				input.setCustomValidity('');
			}
		}
	}

	$: items = data.cart || [];
	$: totalPrice = sum(items.map((item) => item.product.price.amount * item.quantity));
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<div class="w-full rounded-xl bg-white border-gray-300 border p-6 grid grid-cols-3 gap-2">
		<form id="checkout" method="post" class="col-span-2 flex flex-col gap-4" on:submit={checkForm}>
			<h1 class="page-title">Checkout</h1>

			<section class="gap-4 grid grid-cols-6 w-4/5">
				<h2 class="font-light text-2xl col-span-6">Shipment info</h2>

				{#if items.every((item) => !item.product.shipping)}
					<p class="col-span-6 text-gray-800">
						All products in your cart are digital products. You don't need to provide any shipping
						information.
					</p>
				{:else}
					<label class="form-label col-span-3">
						First name
						<input type="text" class="form-input" name="firstName" required />
					</label>

					<label class="form-label col-span-3">
						Last name
						<input type="text" class="form-input" name="lastName" required />
					</label>

					<label class="form-label col-span-6">
						Address
						<input type="text" class="form-input" name="address" required />
					</label>

					<label class="form-label col-span-3">
						Country
						<select name="country" class="form-input" required>
							{#each Object.entries(COUNTRIES) as [code, country]}
								<option value={code}>{country}</option>
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

						<input type="text" name="zip" class="form-input" required />
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
							disabled={data.paymentMethods.length === 0}
							required
						>
							{#if data.paymentMethods.includes('bitcoin')}
								{#if totalPrice >= 0.00001}
									<option value="bitcoin">Bitcoin</option>
								{/if}
							{/if}
							{#if data.paymentMethods.includes('lightning')}
								<option value="lightning">Lightning</option>
							{/if}
						</select>
						{#if data.paymentMethods.length === 0}
							<p class="text-red-400">No payment methods available.</p>
						{/if}
						<a href="/connect" class="underline text-blue"> Connect another wallet </a>
					</div>
				</label>
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
									placeholder="npub1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
									required={key === 'paymentStatus'}
								/>
							</label>
							<label class="form-label">
								Email
								<input type="email" class="form-input" name="{key}Email" />
							</label>
						</div>
					</article>
				{/each}
			</section>
		</form>
		<div>
			<article
				class="rounded sticky top-4 -mr-2 -mt-2 p-3 border border-gray-300 flex flex-col overflow-hidden gap-1"
			>
				<div class="flex justify-between">
					<a href="/cart" class="text-blue hover:underline">&lt;&lt;Back to cart</a>
					{#if data.cart?.length === 1}
						<p>{data.cart?.length} product</p>
					{:else}
						<p>{data.cart?.length} products</p>
					{/if}
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
						<h3 class="text-base text-gray-700">{item.product.name}</h3>

						<div class="flex gap-2">
							<div class="w-[50px] h-[50px] min-w-[50px] min-h-[50px] rounded flex items-center">
								{#if item.picture}
									<Picture
										picture={item.picture}
										class="rounded grow object-cover h-full w-full"
										sizes="50px"
									/>
								{/if}
							</div>

							<div class="self-center">
								{#if 0}
									<CartQuantity {item} sm />
								{:else if item.quantity > 1}
									Quantity: {item.quantity}
								{/if}
							</div>

							<div class="flex flex-col ml-auto items-end justify-center">
								<PriceTag
									amount={item.quantity * item.product.price.amount}
									currency={item.product.price.currency}
									class="text-2xl text-gray-800 truncate"
								/>
								<PriceTag
									class="text-base text-gray-600 truncate"
									amount={item.quantity * item.product.price.amount}
									currency={item.product.price.currency}
									convertedTo="EUR"
									exchangeRate={data.exchangeRate}
								/>
							</div>
						</div>
					</form>

					<div class="border-b border-gray-300 col-span-4" />
				{/each}

				<span class="py-1" />

				<div class="bg-gray-190 -mx-3 p-3 flex flex-col">
					<div class="flex justify-between">
						<span class="text-xl text-gray-850">Total</span>
						<PriceTag class="text-2xl text-gray-800" amount={totalPrice} currency="BTC" />
					</div>
					<PriceTag
						class="self-end text-gray-600"
						amount={totalPrice}
						convertedTo="EUR"
						currency="BTC"
						exchangeRate={data.exchangeRate}
					/>
				</div>

				<input
					type="submit"
					class="btn btn-black btn-xl -mx-1 -mb-1 mt-1"
					value="Proceed"
					form="checkout"
				/>
			</article>
		</div>
	</div>
</main>
