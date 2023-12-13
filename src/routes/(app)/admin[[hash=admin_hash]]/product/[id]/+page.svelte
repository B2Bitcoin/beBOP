<script lang="ts">
	import PictureComponent from '$lib/components/Picture.svelte';
	import ProductForm from '$lib/components/ProductForm.svelte';

	export let data;
</script>

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

<a href="{data.adminPrefix}/picture/new?productId={data.product._id}" class="underline">
	Add picture
</a>

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
