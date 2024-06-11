<script lang="ts">
	import { groupBy } from 'lodash-es';
	import type { SetRequired } from 'type-fest';
	import type { Picture } from '$lib/types/Picture';
	import ProductWidgetPOS from '$lib/components/ProductWidget/ProductWidgetPOS.svelte';
	import { POS_PRODUCT_PAGINATION, isPreorder } from '$lib/types/Product';
	import { page } from '$app/stores';

	export let data;
	$: next = Number($page.url.searchParams.get('skip')) || 0;
	$: picturesByProduct = groupBy(
		data.pictures.filter(
			(picture): picture is SetRequired<Picture, 'productId'> => !!picture.productId
		),
		'productId'
	);
	$: filter = $page.url.searchParams.get('filter') ?? 'pos-favorite';
	$: productFiltered =
		filter === 'all'
			? data.products
			: data.products.filter((product) => product.tagIds?.includes(filter));
	$: displayedProducts = productFiltered.slice(next, next + POS_PRODUCT_PAGINATION);
	$: totalPages = Math.ceil(productFiltered.length / POS_PRODUCT_PAGINATION);
	$: currentPage = Math.floor(next / POS_PRODUCT_PAGINATION) + 1;
</script>

<div class="grid grid-cols-3 gap-4">
	<div class=" touchScreen-ticket-menu"></div>
	<div class="col-span-2">
		<div class="grid grid-cols-2 gap-4 text-3xl text-center">
			<a class="col-span-2 touchScreen-category-cta" href="?filter=pos-favorite&skip=0">FAVORIS</a>
			<div class="touchScreen-category-cta">E-pub(salon FR)</div>
			<div class="touchScreen-category-cta">Livre audio CD(salon FR)</div>
			<div class="touchScreen-category-cta">Livre physique(salon FR)</div>
			<div class="touchScreen-category-cta">autres aricles(salon FR)</div>
			<a class="col-span-2 touchScreen-category-cta" href="?filter=all&skip=0">TOUS LES ARTICLES</a>

			<div class="col-span-2 grid grid-cols-2 gap-4">
				{#each displayedProducts as product}
					{#if !isPreorder(product.availableDate, product.preorder)}
						<ProductWidgetPOS {product} pictures={picturesByProduct[product._id]} />
					{/if}
				{/each}
				<div class="col-span-2 grid-cols-1 flex gap-2 justify-center">
					{#if next > 0}
						<a
							class="btn touchScreen-product-secondaryCTA text-3xl"
							on:click={() => (next = Math.max(0, next - POS_PRODUCT_PAGINATION))}
							href={`?filter=${filter}&skip=${Math.max(0, next - POS_PRODUCT_PAGINATION)}`}>&lt;</a
						>
					{/if}
					PAGE {currentPage}/{totalPages}
					{#if next + POS_PRODUCT_PAGINATION < productFiltered.length}
						<a
							class="btn touchScreen-product-secondaryCTA text-3xl"
							on:click={() => (next += POS_PRODUCT_PAGINATION)}
							href={`?filter=${filter}&skip=${next + POS_PRODUCT_PAGINATION}`}>&gt;</a
						>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<div class="grid grid-cols-3 gap-4 mt-2">
	<div class="touchScreen-ticket-menu text-3xl p-4 text-center">TICKETS</div>
	<div class="col-span-2 grid grid-cols-3 gap-4">
		<div class="col-span-1 touchScreen-action-secondaryCTA text-3xl p-4">SAUVER</div>
		<div class="col-span-1 touchScreen-action-secondaryCTA text-3xl p-4">POOL</div>
		<div class="col-span-1 touchScreen-action-secondaryCTA text-3xl p-4">OUVRIR TIROIR</div>
	</div>
</div>
<div class="grid grid-cols-2 gap-4 mt-2">
	<div class="touchScreen-action-cta text-3xl p-4 text-center">PAYER</div>
	<div class="grid grid-cols-2 gap-4">
		<div class="col-span-1 touchScreen-action-cancel text-3xl p-4 text-center">❎</div>
		<div class="col-span-1 touchScreen-action-delete text-3xl p-4 text-center">🗑️</div>
	</div>
</div>
