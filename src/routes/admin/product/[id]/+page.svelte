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
				Nom
				<input type="text" name="name" class="form-input block" value={data.product.name} />
			</label>
			<label class="block w-full mt-4 leading-8">
				Prix (BTC)
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
				Description
				<textarea name="description" cols="30" rows="10" class="block form-input"
					>{data.product.description}</textarea
				>
			</label>

			<button type="submit" class="mt-4 btn btn-blue text-white">Valider</button>
		</form>
	</div>

	<h2 class="text-2xl my-4">Photos</h2>

	<a href="/admin/pictures/new?productId={data.product._id}" class="underline">Add picture</a>

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
