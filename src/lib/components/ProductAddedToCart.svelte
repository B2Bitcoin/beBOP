<script lang="ts">
	import type { BasicProductFrontend } from '$lib/types/Product';
	import type { Picture as PictureType } from '$lib/types/Picture';
	import Picture from './Picture.svelte';
	import PriceTag from './PriceTag.svelte';
	import IconCross from './icons/IconCross.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Currency } from '$lib/types/Currency';
	import { useI18n } from '$lib/i18n';

	export let product: BasicProductFrontend;
	export let picture: PictureType | undefined;
	export let customPrice: { amount: number; currency: Currency } | undefined;

	let className = '';
	export { className as class };

	const { t } = useI18n();

	const dispatch = createEventDispatcher<{ dismiss: void }>();
</script>

<div class="{className} flex flex-wrap p-2 gap-4 relative">
	<Picture {picture} class="w-[138px] h-[138px] border-gray-300 border rounded object-cover" />
	<div class="flex flex-col grow gap-1">
		<h2 class="text-black text-[22px] font-medium">{t('product.addedToCart')}</h2>
		<h3 class="text-gray-850 text-base font-light">{product.name}</h3>
		{#if customPrice}
			<PriceTag
				currency={customPrice.currency}
				class="text-xl text-gray-800"
				amount={customPrice.amount}
				main
			/>
		{:else}
			<PriceTag
				currency={product.price.currency}
				class="text-xl text-gray-800"
				amount={product.price.amount}
				main
			/>
		{/if}

		<div class="flex gap-2">
			<a href="/cart" class="grow basis-0 btn btn-gray"> {t('cart.cta.view')} </a>
			<a href="/checkout" class="grow basis-0 btn btn-black"> {t('cart.cta.checkout')} </a>
		</div>
	</div>
	<button class="absolute top-2 right-2" type="button" on:click={() => dispatch('dismiss')}>
		<IconCross />
	</button>
</div>
