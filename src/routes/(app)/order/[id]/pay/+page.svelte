<script context="module" lang="ts">
	declare global {
		interface Window {
			SumUpCard: {
				mount: (options: {
					id: string;
					checkoutId: string;
					onResponse?: (
						type: 'sent' | 'auth-screen' | 'error' | 'success',
						body?: string
					) => unknown;
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
		}
	}
</script>

<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';

	import { page } from '$app/stores';
	import OrderSummary from '$lib/components/OrderSummary.svelte';

	import { onMount } from 'svelte';

	export let data;

	function mountSumUpCard() {
		// Should always be true due to backend validation, doing this for TS
		if (data.order.payment.checkoutId) {
			window.SumUpCard.mount({
				id: 'sumup-card',
				checkoutId: data.order.payment.checkoutId,
				onResponse: function (type) {
					if (type === 'success') {
						goto('/order/' + $page.params.id);
					}
				}
			});
		}
	}

	onMount(() => {
		if (window.SumUpCard) {
			mountSumUpCard();
		} else {
			document.head.append(
				Object.assign(document.createElement('script'), {
					src: 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js',
					async: false,
					defer: false,
					onload: () => mountSumUpCard()
				})
			);
		}
	});

	afterNavigate(() => {
		const script = document.querySelector(
			'script[src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"]'
		);
		if (script) {
			document.head.removeChild(script);
		}
	});
</script>

<main class="mx-auto max-w-7xl py-10 px-6 flex flex-col md:flex-row gap-4 justify-around">
	<div class="grow">
		<div id="sumup-card" class="max-w-lg mx-auto bg-white text-gray-700 rounded shadow"></div>
	</div>
	<div class="self-center md:self-stretch">
		<OrderSummary order={data.order} class="sticky top-4 -mt-1" />
	</div>
</main>
<!-- 
<style>
	#sumup-card {
		--cui-border-danger: #f44336;
		--cui-border-normal: #ccc;
		--cui-border-focus: #ebf4ff;
	}
</style> -->
