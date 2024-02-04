<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import type { CountryAlpha2 } from '$lib/types/Country';
	import type { Currency } from '$lib/types/Currency';
	import PriceTag from './PriceTag.svelte';
	import Trans from './Trans.svelte';

	const { t, countryName } = useI18n();

	export let vatAmount: number;
	export let vatCurrency: Currency;
	export let vatRate: number;
	export let vatCountry: CountryAlpha2;
	export let vatSingleCountry: boolean;
	export let isDigital: boolean;
</script>

<div class="flex justify-end border-b border-gray-300 pb-6 gap-6">
	<div class="flex flex-col">
		<h2 class="text-[28px]">{t('cart.vat')} ({vatRate}%):</h2>
		<p class="text-sm">
			{t('cart.vatRate', { country: countryName(vatCountry) })}.
			{#if vatSingleCountry || isDigital}
				{t('cart.vatSellerCountry')}
			{:else}
				<Trans key="cart.vatIpCountry">
					<a href="https://lite.ip2location.com" slot="0"> https://lite.ip2location.com </a>
				</Trans>
			{/if}
		</p>
	</div>
	<div class="flex flex-col items-end">
		<PriceTag amount={vatAmount} currency={vatCurrency} main class="text-[28px]" />
		<PriceTag class="text-base" amount={vatAmount} currency={vatCurrency} secondary />
	</div>
</div>
