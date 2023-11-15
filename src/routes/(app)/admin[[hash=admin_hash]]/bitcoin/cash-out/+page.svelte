<script lang="ts">
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { currencies } from '$lib/stores/currencies';
	import { pick } from 'lodash-es';
	import { BityApiClient, type BityApiClientInterface } from '@bity/api';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let data;

	let cashoutAmount = 0;

	$: fees = cashoutAmount * 0.008;
	$: total = cashoutAmount - fees;
	$: remaining = data.balance - cashoutAmount;

	let bity: BityApiClientInterface;

	onMount(() => {
		// @ts-expect-error Bity needs to get their types right
		bity = new BityApiClient({
			exchangeApiUrl: 'https://exchange.api.bity.com/v2/',
			oauthConfig: {
				authorizationUrl: 'https://connect.bity.com/oauth2/auth',
				tokenUrl: 'https://connect.bity.com/oauth2/token',
				clientId: 'your-client-id',
				scopes: [
					'https://auth.bity.com/scopes/exchange.place',
					'https://auth.bity.com/scopes/exchange.history'
				],
				redirectUrl: $page.url.origin + '/api/auth/callback/bity',
				onAccessTokenExpiry: (refreshAccessToken) => {
					// As a developer you don't really need to handle anything here. But don't
					// forget this section. If refreshAccessToken() is not called, tokens will
					// not auto-renew.
					console.log(
						'Access token expired! Trying to get new token from re-using auth grant code.'
					);
					return refreshAccessToken();
				},
				onInvalidGrant: (refreshAuthCodeOrRefreshToken) => {
					console.log('Auth grant or refresh token expired! Get a new authorization grant code.');
					// Normally call refreshAuthCodeOrRefreshToken(); which calls fetchAuthorizationCode().
					// But you can do whatever you want - maybe you want a user to press
					// a button that executes fetchAuthorizationCode() instead.
				}
			}
		});
	});

	function authorize() {
		// Redirects user to Bity OAuth 2.0 service
		bity.fetchAuthorizationCode();
	}

	// function createOrder function() {
	//   // Will automatically pass and renew tokens.
	//   bity.createOrder(...);
	// }
</script>

<h1 class="text-3xl">Bitcoin node - Bity cash out</h1>

<h2 class="text-2xl">Balance</h2>

<PriceTag amount={data.balance} currency="BTC" force />
<PriceTag amount={data.balance} convertedTo="SAT" force currency="BTC" />

{#if $currencies.priceReference !== 'BTC' && $currencies.priceReference !== 'SAT'}
	<PriceTag amount={data.balance} convertedTo={$currencies.priceReference} currency="BTC" />
{/if}

<h2 class="text-2xl">Current exchange rate</h2>

<pre>{JSON.stringify(
		pick(data.exchangeRate, ['BTC_CHF', 'BTC_EUR', 'BTC_USD']),
		null,
		'\t'
	).replaceAll(/[\t{}]/g, '')}</pre>

<h2 class="text-2xl">Cash-out amount (BTC)</h2>

<input type="number" class="form-input" bind:value={cashoutAmount} />

<h2 class="text-2xl">Billing currency estimation</h2>

<p>
	Selected amount: <PriceTag
		amount={cashoutAmount}
		currency="BTC"
		class="inline-flex font-bold"
		convertedTo={$currencies.priceReference}
	/>
</p>

<p>
	Conversion fees will be applied, and bitcoin volatility may cause the final amount to be
	different. This is an estimation.
</p>

<p>
	Estimated fees: <PriceTag
		amount={-fees}
		currency="BTC"
		convertedTo={$currencies.priceReference}
		class="inline-flex font-bold"
	/> (0.8%)
</p>

<p>
	Total amount, fees deducted: <PriceTag
		amount={total}
		currency="BTC"
		convertedTo={$currencies.priceReference}
		class="inline-flex font-bold"
	/>
</p>

<h2 class="text-2xl">Remaining balance after withdrawal</h2>

<PriceTag amount={remaining} currency="BTC" force />
<PriceTag amount={remaining} convertedTo="SAT" force currency="BTC" />

{#if $currencies.priceReference !== 'BTC' && $currencies.priceReference !== 'SAT'}
	<PriceTag amount={remaining} convertedTo={$currencies.priceReference} currency="BTC" />
{/if}

<div class="flex justify-between">
	<button class="btn btn-orange" on:click={authorize}>Request cashout</button>
	<a href="{data.adminPrefix}/bitcoin" class="btn btn-gray">Cancel</a>
</div>
