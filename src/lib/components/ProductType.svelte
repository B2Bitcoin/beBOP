<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import IconBoxTaped from './icons/IconBoxTaped.svelte';
	import IconDollar from './icons/IconDollar.svelte';
	import IconDownTo from './icons/IconDownTo.svelte';
	import IconHandHeart from './icons/IconHandHeart.svelte';

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
	let className = '';
	export { className as class };
</script>

{#if product.preorder && product.availableDate && product.availableDate > new Date()}
	<span class="px-3 flex gap-2 items-center {className} text-blue-500 bg-blue-200 rounded-full">
		<IconDollar /> PREORDER
	</span>
{/if}

{#if product.type == 'resource'}
	<span class="px-3 flex gap-2 items-center {className} text-green-700 bg-green-200 rounded-full">
		<IconDownTo /> RESOUCE
	</span>
{/if}

{#if product.type == 'donation'}
	<span
		class="px-3 flex gap-2 items-center {className} text-rosebudcherry-700 bg-rosebudcherry-200 rounded-full"
	>
		<IconHandHeart /> DONATION
	</span>
{/if}

{#if product.shipping}
	<span
		class="px-3 flex gap-2 items-center {className} text-roseofsharon-700 bg-roseofsharon-200 rounded-full"
	>
		<IconBoxTaped /> PHYSICAL
	</span>
{/if}

{#if product.type == 'subscription'}
	<span class="px-3 flex gap-2 items-center {className} text-jagger-700 bg-jagger-200 rounded-full">
		<IconDownTo /> MONTHLY SUB
	</span>
{/if}
