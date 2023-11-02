<script lang="ts">
	import { page } from '$app/stores';

	const productId = $page.url.searchParams.get('productId');
	const sliderId = $page.url.searchParams.get('sliderId');
</script>

<h1 class="text-3xl">Add a picture</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4">
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

	{#if productId}
		<input type="hidden" name="productId" value={productId} />
	{/if}

	{#if sliderId}
		<p>
			Associated slider: <a href="/admin/slider/{sliderId}" class="hover:underline">{sliderId}</a>
		</p>
	{/if}

	{#if sliderId}
		<input type="hidden" name="sliderId" value={sliderId} />
	{/if}

	<input type="submit" class="btn btn-gray self-start" value="Add" />
</form>
