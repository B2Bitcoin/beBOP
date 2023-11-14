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
	export let pictures: Picture[] | [];
</script>

<div class="flex flex-col mx-auto rounded p-4 sm:flex-row sm:gap-2 {className}">
	<div class="flex flex-wrap bg-gray-100 w-full sm:w-5/6 mb-4 sm:mb-0">
		<div class="p-4 w-full sm:w-2/3">
			<a href="/product/{product._id}">
				<h2 class="text-2xl font-bold mb-2">{product.name}</h2>
			</a>
			<a href="/product/{product._id}">
				<p class="text-gray-600 mb-4">{product.shortDescription}</p>
			</a>
			<div class="flex flex-wrap gap-6 items-end">
				<div class="bg-blue-500 text-white text-xl text-center w-full md:w-[150px] p-1">
					Buy now
				</div>
				<div class="bg-blue-500 text-white text-xl text-center w-full md:w-[150px] p-1">
					<a href="/product/{product._id}"> Details</a>
				</div>
			</div>
		</div>

		<div class="justify-end w-full sm:w-1/3 sm:mt-0">
			<a href="/product/{product._id}">
				<PictureComponent picture={pictures[0]} class="h-[280px] mt-5 ml-auto object-contain" />
			</a>
		</div>
	</div>

	<div class="ml-0 sm:ml-4 w-full sm:w-1/6 flex-col hidden sm:inline">
		{#if pictures.length > 1}
			{#each pictures as picture}
				<PictureComponent {picture} class="h-[100px] w-[100px] rounded-sm mb-2 cursor-pointer" />
			{/each}
		{/if}
	</div>
</div>
