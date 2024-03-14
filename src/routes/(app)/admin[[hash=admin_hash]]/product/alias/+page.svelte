<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Bulk Alias Change</h1>

<form class="flex flex-col gap-2" method="post">
	{#each data.products as product}
		<h2 class="text-2xl">{product.name}</h2>
		<div class="gap-4 flex flex-col md:flex-row">
			<label class="w-full">
				Current slug
				<input class="form-input" type="text" placeholder="slug" value={product._id} disabled />
			</label>

			<label class="w-full">
				Alias
				<input
					class="form-input"
					type="text"
					name="{product._id}.alias"
					placeholder="alias"
					value={product.alias?.[1] ?? ''}
				/>
			</label>
		</div>
	{/each}
	<button class="btn btn-black self-start mt-4" type="submit">Update</button>
</form>
