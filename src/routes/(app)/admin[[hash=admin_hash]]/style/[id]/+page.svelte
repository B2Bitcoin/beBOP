<script lang="ts">
	import { styleFormStructure, systemFonts } from '$lib/types/Style.js';

	export let data;
	const style = data.style;

	let name = style ? style.name : '';
	let formData = data.style;
</script>

<h1 class="text-3xl">Edit theme</h1>

<form method="post" class="flex flex-col gap-4">
	<label class="form-label">
		Theme name
		<input class="form-input" type="text" name="name" bind:value={name} required />
	</label>
	{#if formData}
		{#each Object.entries(styleFormStructure) as [section, fields]}
			<h2 class="text-2xl">{fields.label}</h2>
			{#each fields.elements as field}
				{#if field.isColor}
					<label class="form-label">
						{field.label} (light)
						<input
							class="form-input"
							type="text"
							name={`${section}.${field.name}.light`}
							placeholder={field.placeholder}
							required
						/>
					</label>
					<label class="form-label">
						{field.label} (dark)
						<input
							class="form-input"
							type="text"
							name={`${section}.${field.name}.dark`}
							placeholder={field.placeholder}
							required
						/>
					</label>
				{:else}
					<label class="form-label">
						{field.label}
						<select
							class="form-input"
							name={`${section}.${field.name}`}
							placeholder={field.placeholder}
							required
						>
							{#each systemFonts as font}
								<option value={font}>{font}</option>
							{/each}
						</select>
					</label>
				{/if}
			{/each}
		{/each}
	{/if}

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
