<script lang="ts">
	import { isPreorder, type Product } from '$lib/types/Product';
	import IconBoxTaped from './icons/IconBoxTaped.svelte';
	import IconDollar from './icons/IconDollar.svelte';
	import IconDownTo from './icons/IconDownTo.svelte';
	import IconHandHeart from './icons/IconHandHeart.svelte';
	import IconRotate from './icons/IconRotate.svelte';

	export let product: Pick<
		Product,
		| '_id'
		| 'name'
		| 'price'
		| 'shortDescription'
		| 'preorder'
		| 'availableDate'
		| 'type'
		| 'shipping'
	>;
	export let hasDigitalFiles: boolean;

	let className = '';
	export { className as class };

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

{#if isPreorder(product.availableDate, product.preorder)}
	<span class="{baseClasses} {className} text-blue-500 bg-blue-200">
		<IconDollar /> Preorder
	</span>
{/if}
{#if !product.preorder && product.availableDate && product.availableDate > new Date()}
	<span class="{baseClasses} {className} text-yellow-500 bg-yellow-100"> Preview </span>
{/if}

{#if !(product.preorder && product.availableDate && product.availableDate > new Date()) && !product.shipping}
	{#if product.type === 'resource' && !hasDigitalFiles}
		<span class="{baseClasses} {className} text-roseofsharon-700 bg-roseofsharon-200">
			<IconDownTo /> Resource
		</span>
	{/if}
	{#if product.type === 'resource' && hasDigitalFiles}
		<span class="{baseClasses} {className} text-green-700 bg-green-200">
			<IconDownTo /> Digital Resource
		</span>
	{/if}
{/if}

{#if product.type === 'donation'}
	<span class="{baseClasses} {className} text-rosebudcherry-700 bg-rosebudcherry-200">
		<IconHandHeart /> Donation
	</span>
{/if}

{#if product.shipping}
	<span class="{baseClasses} {className} text-roseofsharon-700 bg-roseofsharon-200">
		<IconBoxTaped /> Physical
	</span>
{/if}

{#if product.type === 'subscription'}
	<span class="{baseClasses} {className} text-jagger-700 bg-jagger-200">
		<IconRotate /> Monthly Sub
	</span>
{/if}
