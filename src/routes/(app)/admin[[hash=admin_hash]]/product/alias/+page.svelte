<script lang="ts">
	export let data;
	let listAliases = data.products.flatMap((product) => product.alias?.[1]);

	function hasDuplicates(list: string[]) {
		let uniqueSet = new Set(list.filter((alias) => alias !== null && alias !== undefined));
		return uniqueSet.size !== list.filter((alias) => alias !== null && alias !== undefined).length;
	}
</script>

<h1 class="text-3xl">Bulk Alias Change</h1>

<form class="flex flex-col gap-2" method="post">
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
	{#if hasDuplicates(listAliases)}
		<span class="text-red-500">Duplicated aliases was found, please fix them before submit</span
		>{/if}
	<button class="btn btn-black self-start mt-4" type="submit" disabled={hasDuplicates(listAliases)}
		>Update</button
	>
</form>
