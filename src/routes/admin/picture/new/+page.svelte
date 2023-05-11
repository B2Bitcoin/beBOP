<script lang="ts">
	import { page } from '$app/stores';

	const productId = $page.url.searchParams.get('productId');
</script>

<main class="p-4">
	<h1 class="text-3xl">Add a picture</h1>

	<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4 mt-4">
		<label>
			Name of the picture
			<input class="form-input block" type="text" name="name" placeholder="Final name" required />
		</label>

		<label>
			JPEG or PNG file
			<input
				type="file"
				name="picture"
				accept="image/jpeg,image/png,image/webp"
				class="block"
				required
			/>
		</label>

		{#if productId}
			<p>
				Associated product: <a href="/admin/product/{productId}" class="hover:underline"
					>{productId}</a
				>
			</p>
		{/if}

		<input type="hidden" name="productId" value={productId || ''} />

		<input type="submit" class="btn btn-gray self-start" value="Add" />
	</form>
</main>
