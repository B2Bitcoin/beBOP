<script lang="ts">
	import './touch.css';
</script>

<svelte:head>
	<meta name="viewport" content="width=1024" />
</svelte:head>
<main class="fixed top-0 bottom-0 right-0 left-0 bg-white p-4">
	<div class="grid grid-cols-3 gap-4">
		<div class=" bg-yellow-100"></div>
		<div class="col-span-2">
			<div class="grid grid-cols-2 gap-4 text-white text-3xl text-center">
				<div class="col-span-2 touchScreen-category-cta">FAVORIS</div>
				<div class="touchScreen-category-cta">E-pub(salon FR)</div>
				<div class="touchScreen-category-cta">Livre audio CD(salon FR)</div>
				<div class="touchScreen-category-cta">Livre physique(salon FR)</div>
				<div class="touchScreen-category-cta">autres aricles(salon FR)</div>
				<div class="col-span-2 touchScreen-category-cta">TOUS LES ARTICLES</div>

				<div class="col-span-2 bg-gray-400">Liste produits</div>
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
</main>
