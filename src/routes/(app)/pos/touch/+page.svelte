<script lang="ts">
</script>

<svelte:head>
	<meta name="viewport" content="width=1024" />
</svelte:head>
<main class="fixed top-0 bottom-0 right-0 left-0 bg-white p-4">
	<div class="grid grid-cols-3 gap-4">
		<div class=" bg-yellow-100"></div>
		<div class="col-span-2">
			<div class="grid grid-cols-2 gap-4 text-white text-3xl text-center">
				<div class="col-span-2 bg-rosebudcherry-500">FAVORIS</div>
				<div class="bg-rosebudcherry-500">E-pub(salon FR)</div>
				<div class="bg-rosebudcherry-500">Livre audio CD(salon FR)</div>
				<div class="bg-rosebudcherry-500">Livre physique(salon FR)</div>
				<div class="bg-rosebudcherry-500">autres aricles(salon FR)</div>
				<div class="col-span-2 bg-rosebudcherry-500">TOUS LES ARTICLES</div>

				<div class="col-span-2 bg-gray-400">Liste produits</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-3 gap-4 mt-2">
		<div class="bg-gray-500 text-3xl p-4 text-center">TICKETS</div>
		<div class="col-span-2 grid grid-cols-3 gap-4">
			<div class="col-span-1 bg-gray-500 text-3xl p-4">SAUVER</div>
			<div class="col-span-1 bg-gray-500 text-3xl p-4">POOL</div>
			<div class="col-span-1 bg-gray-500 text-3xl p-4">OUVRIR TIROIR</div>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-4 mt-2">
		<div class="bg-gray-500 text-3xl p-4 text-center">PAYER</div>
		<div class="grid grid-cols-2 gap-4">
			<div class="col-span-1 bg-yellow-300 text-3xl p-4 text-center">❎</div>
			<div class="col-span-1 bg-red-500 text-3xl p-4 text-center">🗑️</div>
		</div>
	</div>
</main>
