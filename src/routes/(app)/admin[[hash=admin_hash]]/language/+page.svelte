<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Languages</h1>

<form class="contents" method="post" action="?/custom">
	{#each data.customTranslationKeys as d}
		<label class="form-label">
			Custom translation keys - {d.locale}
			<textarea
				class="form-input"
				name={d.locale}
				cols="30"
				rows="10"
				value={JSON.stringify(d.keys, null, 2)}
			/>
		</label>
	{/each}

	<button class="btn btn-black self-start">Save</button>
</form>
