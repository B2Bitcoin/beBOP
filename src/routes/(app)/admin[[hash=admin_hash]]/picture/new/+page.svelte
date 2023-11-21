<script lang="ts">
	import { page } from '$app/stores';
	import { upperFirst } from '$lib/utils/upperFirst.js';

	export let data;

	const productId = $page.url.searchParams.get('productId');
	const sliderId = $page.url.searchParams.get('sliderId');
	const themeId = $page.url.searchParams.get('themeId');

	let files: FileList | null = null;
	let fileName = '';
</script>

<h1 class="text-3xl">Add a picture</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4">
	<label>
		JPEG or PNG file
		<input
			type="file"
			name="picture"
			bind:files
			on:change={() => {
				if (files && files.length > 0) {
					fileName = files[0].name;
				} else {
					fileName = '';
				}
			}}
			accept="image/jpeg,image/png,image/webp"
			class="block"
			required
		/>
	</label>

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

	{#if productId}
		<p>
			Associated product: <a href="{data.adminPrefix}/product/{productId}" class="hover:underline"
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

	{#if themeId}
		<input type="hidden" name="themeId" value={themeId} />
		<label>
			Type of the logo
			<select class="form-input" name="typeLogo">
				{#each ['light', 'dark'] as type}
					<option value={type}>{upperFirst(type)}</option>
				{/each}
			</select>
		</label>
	{/if}
	{#if themeId}
		<p>
			Associated theme: <a href="/admin/theme/{themeId}" class="hover:underline">{themeId}</a>
		</p>
	{/if}

	<input type="submit" class="btn btn-gray self-start" value="Add" />
</form>
