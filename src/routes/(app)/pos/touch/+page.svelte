<script lang="ts">
	import { groupBy } from 'lodash-es';
	import type { SetRequired } from 'type-fest';
	import type { Picture } from '$lib/types/Picture';
	import ProductWidgetPOS from '$lib/components/ProductWidget/ProductWidgetPOS.svelte';
	import { isPreorder } from '$lib/types/Product';

	export let data;
	$: picturesByProduct = groupBy(
		data.pictures.filter(
			(picture): picture is SetRequired<Picture, 'productId'> => !!picture.productId
		),
		'productId'
	);
</script>

<div class="grid grid-cols-3 gap-4">
	<div class=" touchScreen-ticket-menu"></div>
	<div class="col-span-2">
		<div class="grid grid-cols-2 gap-4 text-3xl text-center">
			<div class="col-span-2 touchScreen-category-cta">FAVORIS</div>
			<div class="touchScreen-category-cta">E-pub(salon FR)</div>
			<div class="touchScreen-category-cta">Livre audio CD(salon FR)</div>
			<div class="touchScreen-category-cta">Livre physique(salon FR)</div>
			<div class="touchScreen-category-cta">autres aricles(salon FR)</div>
			<div class="col-span-2 touchScreen-category-cta">TOUS LES ARTICLES</div>

			<div class="col-span-2 grid grid-cols-2 gap-4">
				{#each data.products as product}
					{#if !isPreorder(product.availableDate, product.preorder)}
						<ProductWidgetPOS {product} pictures={picturesByProduct[product._id]} />
					{/if}
				{/each}
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
