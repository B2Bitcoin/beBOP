<script lang="ts">
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';
	import { useI18n } from '$lib/i18n';

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
	const { t } = useI18n();
	let loading = false;
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
			<form method="post" class="contents">
				<div class="flex flex-wrap gap-6 items-end">
					<button
						type="submit"
						formaction="/product/{product._id}?/buy"
						on:submit={() => (loading = true)}
						disabled={loading}
						class="bg-blue-500 text-white text-xl text-center w-full md:w-[150px] p-1"
					>
						{t('product.cta.buy')}
					</button>
					<a href="/product/{product._id}">
						<div class="bg-blue-500 text-white text-xl text-center w-full md:w-[150px] p-1">
							{t('product.cta.details')}
						</div>
					</a>
				</div>
			</form>
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
				<PictureComponent {picture} class="w-[90px] h-[90px] rounded-sm mb-2 cursor-pointer" />
			{/each}
		{/if}
	</div>
</div>
