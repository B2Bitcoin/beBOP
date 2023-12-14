<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import { isPreorder, type Product } from '$lib/types/Product';
	import IconBoxTaped from './icons/IconBoxTaped.svelte';
	import IconDollar from './icons/IconDollar.svelte';
	import IconDownTo from './icons/IconDownTo.svelte';
	import IconHandHeart from './icons/IconHandHeart.svelte';
	import IconRotate from './icons/IconRotate.svelte';

	export let product: Pick<Product, 'preorder' | 'availableDate' | 'type' | 'shipping'>;
	export let hasDigitalFiles: boolean;
	export let depositPercentage: number | undefined = undefined;

	let className = '';
	export { className as class };

	const { t } = useI18n();

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

{#if isPreorder(product.availableDate, product.preorder)}
	<span class="{baseClasses} {className} text-blue-500 bg-blue-200 whitespace-nowrap">
		<IconDollar />
		{t('product.type.preorder')}
	</span>
{/if}
{#if depositPercentage !== undefined && depositPercentage !== null && depositPercentage < 100}
	<span class="{baseClasses} {className} text-blue-500 bg-blue-200 whitespace-nowrap">
		<IconDollar />
		{t('product.type.deposit')}
	</span>
{/if}
{#if !product.preorder && product.availableDate && product.availableDate > new Date()}
	<span class="{baseClasses} {className} text-yellow-500 bg-yellow-100 whitespace-nowrap">
		{t('product.type.preview')}
	</span>
{/if}

{#if !(product.preorder && product.availableDate && product.availableDate > new Date()) && !product.shipping}
	{#if product.type === 'resource' && !hasDigitalFiles}
		<span
			class="{baseClasses} {className} text-roseofsharon-700 bg-roseofsharon-200 whitespace-nowrap"
		>
			<IconDownTo />
			{t('product.type.resource')}
		</span>
	{/if}
	{#if product.type === 'resource' && hasDigitalFiles}
		<span class="{baseClasses} {className} text-green-700 bg-green-200 whitespace-nowrap">
			<IconDownTo />
			{t('product.type.digitalResource')}
		</span>
	{/if}
{/if}

{#if product.type === 'donation'}
	<span
		class="{baseClasses} {className} text-rosebudcherry-700 bg-rosebudcherry-200 whitespace-nowrap"
	>
		<IconHandHeart />
		{t('product.type.donation')}
	</span>
{/if}

{#if product.shipping}
	<span
		class="{baseClasses} {className} text-roseofsharon-700 bg-roseofsharon-200 whitespace-nowrap hidden"
	>
		<IconBoxTaped />
		{t('product.type.phisical')}
	</span>
{/if}

{#if product.type === 'subscription'}
	<span class="{baseClasses} {className} text-jagger-700 bg-jagger-200 whitespace-nowrap">
		<IconRotate />
		{t('product.type.subscription')}
	</span>
{/if}
