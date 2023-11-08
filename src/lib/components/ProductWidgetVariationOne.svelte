<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from './Picture.svelte';

	let className = '';
	export { className as class };

	export let product: Pick<Product, '_id' | 'name' | 'description'>;
	export let picture: Picture | undefined;
	export let pictures: Picture[] | [];
</script>

<div class="mx-auto bg-gray-240 rounded p-4 sm:gap-2 {className}">
	<div class="flex relative">
		<div class="flex flex-col w-[80%] mr-1 p-4 bg-gray-100">
			<h2 class="text-4xl pb-2 uppercase">{product.name}</h2>
			<div class="w-[50%]">
				<h2 class="text-md md:text-2xl">
					{product.description}
				</h2>
			</div>
			<div class="flex text-centern mt-32 gap-8">
				<div class="bg-blue-500 font-semibold text-white text-xl text-center w-[200px] p-1">
					Buy now
				</div>
				<div class="bg-blue-500 font-semibold text-white text-xl text-center w-[200px] p-1">
					Details
				</div>
			</div>
		</div>
		<div
			class="flex absolute mt-16 w-[225px] md:w-[250px] lg:w-[500px] right-24 md:right-[100px] lg:right-[200px]"
		>
			<PictureComponent {picture} class="mx-auto  rounded mr-4 h-auto object-contain" />
		</div>

		<div
			class="flex flex-col gap-2 h-16 w-16 lg:h-24 lg:w-24 absolute right-0 lg:right-16 hidden md:block"
		>
			{#if pictures.length > 1}
				{#each pictures as picture}
					<PictureComponent {picture} class="h-full w-full rounded-sm m-2 cursor-pointer" />
				{/each}
			{/if}
		</div>
	</div>
</div>
