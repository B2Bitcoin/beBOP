<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;
	let listAliases = data.products.flatMap((product) => product.alias?.[1]);

	let errorDuplicateAlias = false;
	let loading = false;
</script>

<h1 class="text-3xl">Bulk Alias Change</h1>

<form
	class="flex flex-col gap-2"
	method="post"
	use:enhance={() => {
		errorDuplicateAlias = false;
		return async ({ result }) => {
			loading = false;

			if (result.type === 'error') {
				errorDuplicateAlias = true;
				return;
			}
		};
	}}
	on:submit|preventDefault={() => (loading = true)}
>
	{#each data.products as product, i}
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
					bind:value={listAliases[i]}
				/>
			</label>
		</div>
	{/each}
	{#if errorDuplicateAlias}
		<span class="text-red-500">Error : Alias must be unique</span>
	{/if}
	<button class="btn btn-black self-start mt-4" type="submit" disabled={loading}>Update</button>
</form>
