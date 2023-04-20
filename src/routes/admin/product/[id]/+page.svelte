<script lang="ts">
	import PictureComponent from '$lib/components/Picture.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main class="p-4">
	<h1 class="text-3xl">Edit a product</h1>

	<div class="flex flex-col">
		<form method="post" action="?/update">
			<label class="block w-full mt-4 leading-8">
				Name
				<input type="text" name="name" class="form-input block" value={data.product.name} />
			</label>
			<label class="block w-full mt-4 leading-8">
				Price (BTC)
				<input
					type="number"
					name="priceAmount"
					class="form-input block"
					step="any"
					value={data.product.price.amount}
				/>
			</label>

			<input type="hidden" name="priceCurrency" value={data.product.price.currency} />

			<label class="block my-4 w-full">
				Short description
				<textarea
					name="shortDescription"
					cols="30"
					rows="2"
					maxlength="250"
					class="block form-input">{data.product.shortDescription}</textarea
				>
			</label>

			<label class="block my-4 w-full">
				Description
				<textarea name="description" cols="30" rows="10" maxlength="10000" class="block form-input"
					>{data.product.description}</textarea
				>
			</label>

			<div class="flex justify-between mt-4 gap-2">
				<button type="submit" class="btn btn-blue">Update</button>
				<a href="/resource/{data.product._id}" class="btn btn-gray">View</a>
				<button type="button" class="ml-auto btn btn-red" formaction="?/delete"> Delete </button>
			</div>
		</form>
	</div>

	<h2 class="text-2xl my-4">Photos</h2>

	<a href="/admin/picture/new?productId={data.product._id}" class="underline">Add picture</a>

	<div class="flex flex-row flex-wrap gap-6 mt-6">
		{#each data.pictures as picture}
			<div class="flex flex-col text-center">
				<a href="/admin/picture/{picture._id}" class="flex flex-col items-center">
					<PictureComponent {picture} class="h-36 block" style="object-fit: scale-down;" />
					<span>{picture.name}</span>
				</a>
			</div>
		{/each}
	</div>
</main>
