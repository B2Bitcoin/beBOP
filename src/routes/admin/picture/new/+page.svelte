<script lang="ts">
	import { page } from '$app/stores';

	const productId = $page.url.searchParams.get('productId');
</script>

<main class="p-4">
	<h1 class="text-3xl">Add a picture</h1>

	<form method="post" enctype="multipart/form-data">
		<label class="block my-4 leading-8">
			Name of the picture
			<input class="form-input block" type="text" name="name" placeholder="Final name" required />
		</label>

		<label class="block my-4 leading-8">
			JPEG or PNG file
			<input type="file" name="picture" accept="image/jpeg" class="block required" />
		</label>

		{#if productId}
			<p>
				Lined product: <a href="/admin/product/{productId}" class="hover:underline">{productId}</a>
			</p>
		{/if}

		<input type="hidden" name="productId" value={productId || ''} />

		<input type="submit" hidden />
	</form>
</main>
