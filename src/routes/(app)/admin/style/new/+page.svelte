<script lang="ts">
	import { styleFormStructure } from '$lib/types/Style.js';
</script>

<h1 class="text-3xl">Create a new theme</h1>

<form method="post" class="flex flex-col gap-4">
	<label class="form-label">
		Theme name
		<input class="form-input" type="text" name="name" required value="FFFFFF" />
	</label>
	{#each Object.entries(styleFormStructure) as [section, fields]}
		<h2 class="text-2xl">{fields.label}</h2>
		{#each fields.elements as field}
			{#if field.isColor}
				<label class="form-label">
					{field.label} (light)
					<input
						class="form-input"
						type="text"
						name={`${section}_${field.name}_light`}
						placeholder={field.placeholder}
						required
						value="FFFFFF"
					/>
				</label>
				<label class="form-label">
					{field.label} (dark)
					<input
						class="form-input"
						type="text"
						name={`${section}_${field.name}_dark`}
						placeholder={field.placeholder}
						required
						value="FFFFFF"
					/>
				</label>
			{:else}
				<label class="form-label">
					{field.label}
					<input
						class="form-input"
						type="text"
						name={`${section}_${field.name}`}
						placeholder={field.placeholder}
						required
						value="Arial"
					/>
				</label>
			{/if}
		{/each}
	{/each}

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
