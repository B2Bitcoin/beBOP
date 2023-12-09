<script lang="ts">
	import PictureComponent from '$lib/components/Picture.svelte';
	import { page } from '$app/stores';
	import ProductForm from '$lib/components/ProductForm.svelte';

	export let data;
</script>

<!-- <h1 class="text-3xl">Edit a product</h1> -->

<ul
	class="flex flex-wrap text-xl font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400"
>
	<li class="mr-2">
		<a
			href="{data.adminPrefix}/product/{data.product._id}"
			class="{$page.url.pathname === `${data.adminPrefix}/product/${data.product._id}`
				? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
				: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
			>Edit a product</a
		>
	</li>
	{#if data.product.type === 'subscription'}
		<li class="mr-2">
			<a
				href="{data.adminPrefix}/product/{data.product._id}/subscribers"
				class="{$page.url.pathname === `${data.adminPrefix}/product/${data.product._id}/subscribers`
					? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
					: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
				>Subscribers</a
			>
		</li>
	{/if}
</ul>

<ProductForm
	globalDeliveryFees={data.deliveryFees}
	product={data.product}
	tags={data.tags}
	adminPrefix={data.adminPrefix}
	reserved={data.reserved}
	defaultActionSettings={data.productActionSettings}
	sold={data.sold}
/>

<h2 class="text-2xl my-4">Photos</h2>

<a href="{data.adminPrefix}/picture/new?productId={data.product._id}" class="underline"
	>Add picture</a
>

<div class="flex flex-row flex-wrap gap-6 mt-6">
	{#each data.pictures as picture}
		<div class="flex flex-col text-center">
			<a href="{data.adminPrefix}/picture/{picture._id}" class="flex flex-col items-center">
				<PictureComponent {picture} class="h-36 block" style="object-fit: scale-down;" />
				<span>{picture.name}</span>
			</a>
		</div>
	{/each}
</div>

{#if data.product.type !== 'donation'}
	<h2 class="text-2xl my-4">Digital Files</h2>

	<a href="{data.adminPrefix}/digital-file/new?productId={data.product._id}" class="underline">
		Add digital file
	</a>

	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each data.digitalFiles as digitalFile}
			<a href="{data.adminPrefix}/digital-file/{digitalFile._id}" class="text-link hover:underline">
				{digitalFile.name}
			</a>
		{/each}
	</div>
{/if}
