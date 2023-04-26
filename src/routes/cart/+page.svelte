<script lang="ts">
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';

	export let data;
</script>

<main class="mx-auto max-w-7xl p-6 gap-4">
	{#each data.cart ?? [] as item}
		<article class="flex items-center p-2 gap-4">
			{#if item.picture}
				<div class="w-[120px] h-[120px] min-w-[120px] min-h-[120px]">
					<Picture picture={item.picture} class="w-[120px] h-[120px] object-contain" />
				</div>
			{/if}
			<div>
				<h2 class="text-xl">{item.product.name}</h2>
				<p>{item.product.shortDescription}</p>
				<p>
					<PriceTag amount={item.product.price.amount} currency={item.product.price.currency} />
				</p>
				<p>Quantity: {item.quantity}</p>
			</div>
		</article>
	{:else}
		<p>Cart is empty</p>
	{/each}
</main>
