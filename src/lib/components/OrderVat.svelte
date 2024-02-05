<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import type { CountryAlpha2 } from '$lib/types/Country';
	import type { Currency } from '$lib/types/Currency';
	import PriceTag from './PriceTag.svelte';
	import IconInfo from './icons/IconInfo.svelte';

	const { t, countryName } = useI18n();

	export let vatAmount: number;
	export let vatCurrency: Currency;
	export let vatRate: number;
	export let vatCountry: CountryAlpha2;
	export let vatSingleCountry: boolean;
	export let isDigital: boolean;
</script>

<div class="flex justify-between items-center">
	<div class="flex flex-col">
		<h3 class="text-base flex flex-row gap-2 items-center">
			{t('cart.vat')} ({vatRate}%)
			<div
				title="{t('cart.vatRate', {
					country: countryName(vatCountry)
				})}. {vatSingleCountry || isDigital
					? t('cart.vatSellerCountry')
					: `${t('cart.vatIpCountryText', { link: 'https://lite.ip2location.com' })}`}"
			>
				<IconInfo class="cursor-pointer" />
			</div>
		</h3>
	</div>

	<div class="flex flex-col ml-auto items-end justify-center">
		<PriceTag class="text-2xl truncate" amount={vatAmount} currency={vatCurrency} main />
		<PriceTag amount={vatAmount} currency={vatCurrency} class="text-base truncate" secondary />
	</div>
</div>
<div class="border-b border-gray-300 col-span-4" />
