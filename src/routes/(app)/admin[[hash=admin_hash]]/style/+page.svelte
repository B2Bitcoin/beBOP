<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Style</h1>
<a href="/admin/style/new" class="underline">Create a new theme</a>

{#if data.styles.length > 0}
	<h2 class="text-2xl">Choose your theme</h2>
	<form method="post" class="flex flex-col gap-6">
		<label class="form-label">
			Main theme
			<select name="mainTheme" class="form-input max-w-[25rem]">
				{#each data.styles as theme}
					<option value={theme._id}>{theme.name}</option>
				{/each}
			</select>
		</label>
		<input type="submit" value="Update" class="btn btn-blue self-start" />
	</form>
{/if}

<h2 class="text-2xl">Theme list :</h2>
{#each data.styles as style}
	<a href={`/admin/style/${style._id}`} class="font-semibold underline">{style.name}</a>
{/each}
