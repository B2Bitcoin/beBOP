<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';

	let className = '';
	export { className as class };

	export let product: Pick<
		Product,
		| '_id'
		| 'name'
		| 'price'
		| 'shortDescription'
		| 'preorder'
		| 'availableDate'
		| 'shipping'
		| 'type'
		| 'actionSettings'
	>;
	export let picture: Picture | undefined;
	export let pictures: Picture[] | [];
</script>

<div class="flex flex-col mx-auto rounded p-4 sm:flex-row sm:gap-2 {className}">
	<div class="ml-0 sm:ml-4 w-full sm:w-1/6 flex-col hidden sm:inline">
		{#if pictures.length > 1}
			{#each pictures as picture}
				<PictureComponent {picture} class="h-[100px] w-[100px] rounded-sm mb-2 cursor-pointer" />
			{/each}
		{/if}
	</div>
	<!-- Left Section: Product Information -->
	<div class="flex flex-wrap bg-gray-100 w-full sm:w-5/6 mb-4 sm:mb-0">
		<!-- Image principale du produit -->
		<div class="justify-center w-full sm:w-1/3 mt-4 sm:mt-0">
			<PictureComponent {picture} class="h-[280px] mt-5 mr-auto object-contain" />
		</div>
		<div class="p-4 w-full sm:w-2/3">
			<!-- Nom du produit -->
			<h2 class="text-2xl font-bold mb-2">{product.name}</h2>

			<!-- Description du produit -->
			<p class="text-gray-600 mb-4">{product.shortDescription}</p>

			<!-- Boutons -->
			<div class="flex flex-wrap gap-6 items-end">
				<div class="bg-blue-500 text-white text-xl text-center w-full md:w-[150px] p-1">
					Buy now
				</div>
				<div class="bg-blue-500 text-white text-xl text-center w-full md:w-[150px] p-1">
					Details
				</div>
			</div>
		</div>
	</div>
</div>
