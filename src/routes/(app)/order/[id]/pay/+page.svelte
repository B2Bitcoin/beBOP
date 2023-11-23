<script context="module" lang="ts">
	declare const SumUpCard: {
		mount: (options: {
			id: string;
			checkoutId: string;
			onResponse?: (type: 'sent' | 'auth-screen' | 'error' | 'success', body?: string) => unknown;
			onLoad?: () => unknown;
			onPaymentMethodsLoad?: () => string[];
			onChangeInstallments?: (
				installments: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
			) => unknown;
			showSubmitButton?: boolean;
			showFooter?: boolean;
			showInstallments?: boolean;
			showZipCode?: boolean;
			showEmail?: boolean;
			email?: string;
			installments?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
			maxInstallments?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
			donateSubmitButton?: boolean;
			amount?: string;
			currency?:
				| 'EUR'
				| 'BGN'
				| 'BRL'
				| 'CHF'
				| 'CZK'
				| 'DKK'
				| 'GBP'
				| 'HUF'
				| 'NOK'
				| 'PLN'
				| 'SEK'
				| 'USD';
			locale?:
				| 'bg-BG'
				| 'cs-CZ'
				| 'da-DK'
				| 'de-AT'
				| 'de-CH'
				| 'de-DE'
				| 'de-LU'
				| 'el-CY'
				| 'el-GR'
				| 'en-GB'
				| 'en-IE'
				| 'en-MT'
				| 'en-US'
				| 'es-CL'
				| 'es-ES'
				| 'et-EE'
				| 'fi-FI'
				| 'fr-BE'
				| 'fr-CH'
				| 'fr-FR'
				| 'fr-LU'
				| 'hu-HU'
				| 'it-CH'
				| 'it-IT'
				| 'lt-LT'
				| 'lv-LV'
				| 'nb-NO'
				| 'nl-BE'
				| 'nl-NL'
				| 'pt-BR'
				| 'pt-PT'
				| 'pl-PL'
				| 'sk-SK'
				| 'sl-SI'
				| 'sv-SE';
			country?:
				| 'AT'
				| 'BE'
				| 'BG'
				| 'BR'
				| 'CH'
				| 'CL'
				| 'CO'
				| 'CY'
				| 'CZ'
				| 'DE'
				| 'DK'
				| 'EE'
				| 'ES'
				| 'FI'
				| 'FR'
				| 'GB'
				| 'GR'
				| 'HR'
				| 'HU'
				| 'IE'
				| 'IT'
				| 'LT'
				| 'LU'
				| 'LV'
				| 'MT'
				| 'NL'
				| 'NO'
				| 'PL'
				| 'PT'
				| 'RO'
				| 'SE'
				| 'SI'
				| 'SK'
				| 'US';
		}) => void;
		googlePay?: {
			merchantId: string;
			merchantName: string;
		};
	};
</script>

<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';

	import { page } from '$app/stores';

	import { onMount } from 'svelte';

	export let data;

	let navigationTriggered = false;

	beforeNavigate(() => {
		navigationTriggered = true;
	});

	onMount(() => {
		SumUpCard.mount({
			id: 'sumup-card',
			checkoutId: data.checkoutId,
			onResponse: function (type, body) {
				if (type === 'success') {
					navigationTriggered = false;
					// Todo: better check for success before redirecting
					setTimeout(() => {
						if (!navigationTriggered) {
							goto('/order/' + $page.params.id);
						}
					}, 3000);
				}
			}
		});
	});
</script>

<svelte:head>
	<script src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"></script>
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<div id="sumup-card"></div>
</main>
