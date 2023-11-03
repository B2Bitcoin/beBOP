<script lang="ts">
	import { page } from '$app/stores';

	const productId = $page.url.searchParams.get('productId');
	let files: FileList;
	let fileName: string;
</script>

<h1 class="text-3xl">Add a picture</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4">
	<label>
		Name of the picture
		<input
			class="form-input block"
			type="text"
			name="name"
			placeholder="Final name"
			required
			bind:value={fileName}
		/>
	</label>

	<label>
		JPEG or PNG file
		<input
			type="file"
			name="picture"
			bind:files
			on:change={() => (fileName = files[0].name)}
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

	<input type="submit" class="btn btn-gray self-start" value="Add" />
</form>
