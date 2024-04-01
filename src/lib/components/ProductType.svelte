<script lang="ts">
	import { isPreorder, type Product } from '$lib/types/Product';
	import ProductTypeDeposit from './ProductType/ProductTypeDeposit.svelte';
	import ProductTypeDigitalResource from './ProductType/ProductTypeDigitalResource.svelte';
	import ProductTypeDonation from './ProductType/ProductTypeDonation.svelte';
	import ProductTypePhysical from './ProductType/ProductTypePhysical.svelte';
	import ProductTypePreorder from './ProductType/ProductTypePreorder.svelte';
	import ProductTypePreview from './ProductType/ProductTypePreview.svelte';
	import ProductTypeResource from './ProductType/ProductTypeResource.svelte';
	import ProductTypeSubscription from './ProductType/ProductTypeSubscription.svelte';
	import ProductTypeTicket from './ProductType/ProductTypeTicket.svelte';

	export let product: Pick<
		Product,
		'preorder' | 'availableDate' | 'type' | 'shipping' | 'isTicket'
	>;
	export let hasDigitalFiles: boolean;
	export let depositPercentage: number | undefined = undefined;

	let className = '';
	export { className as class };
</script>

{#if isPreorder(product.availableDate, product.preorder)}
	<ProductTypePreorder class={className} />
{/if}
{#if depositPercentage !== undefined && depositPercentage !== null && depositPercentage < 100}
	<ProductTypeDeposit class={className} />
{/if}
{#if !product.preorder && product.availableDate && product.availableDate > new Date()}
	<ProductTypePreview class={className} />
{/if}

{#if !(product.preorder && product.availableDate && product.availableDate > new Date()) && !product.shipping && !product.isTicket}
	{#if product.type === 'resource' && !hasDigitalFiles}
		<ProductTypeResource class={className} />
	{/if}
	{#if product.type === 'resource' && hasDigitalFiles}
		<ProductTypeDigitalResource class={className} />
	{/if}
{/if}

{#if product.isTicket}
	<ProductTypeTicket class={className} />
{/if}

{#if product.type === 'donation'}
	<ProductTypeDonation class={className} />
{/if}

{#if product.shipping}
	<ProductTypePhysical class={className} />
{/if}

{#if product.type === 'subscription'}
	<ProductTypeSubscription class={className} />
{/if}
