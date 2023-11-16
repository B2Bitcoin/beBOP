<script lang="ts">
	import { styleFormStructure, systemFonts } from '$lib/types/Style.js';

	export let data;
	const style = data.style;

	let name = style.name || '';
	let formData = {};

	for (let [section, sectionData] of Object.entries(styleFormStructure)) {
		formData[section] = {};
		for (let field of sectionData.elements) {
			const fieldName = field.name;

			if (field.isColor) {
				const currentStyleSection = style[section] || {};
				formData[section][fieldName] = {
					light: currentStyleSection[fieldName]?.light || '',
					dark: currentStyleSection[fieldName]?.dark || ''
				};
			} else {
				formData[section][fieldName] = style[section][fieldName] || '';
			}
		}
	}
</script>

<h1 class="text-3xl">Edit theme</h1>

<form method="post" class="flex flex-col gap-4">
	<label class="form-label">
		Theme name
		<input class="form-input" type="text" name="name" bind:value={name} required />
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
						name={`${section}.${field.name}.light`}
						placeholder={field.placeholder}
						required
						bind:value={formData[section][field.name].light}
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
						bind:value={formData[section][field.name].dark}
					/>
				</label>
			{:else}
				<label class="form-label">
					{field.label}
					<select
						class="form-input"
						name={`${section}.${field.name}`}
						placeholder={field.placeholder}
						bind:value={formData[section][field.name]}
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

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
