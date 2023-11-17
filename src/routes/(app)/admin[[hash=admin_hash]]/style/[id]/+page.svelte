<script lang="ts">
	import { styleFormStructure, systemFonts, type Style } from '$lib/types/Style.js';

	export let data;
	const style = data.style;

	let name = style ? style.name : '';
	let formData = data.style as Style;
	function generateNested(themeData: Style): string {
		let nested = '';

		function processStyleObject(styleObject: Style, prefix = '') {
			for (const [key, value] of Object.entries(styleObject)) {
				if (typeof value === 'object') {
					processStyleObject(value as Style, `${prefix}${key}.`);
				} else {
					nested += `${prefix}${key}:${value};`;
				}
			}
		}
		processStyleObject(themeData);

		return nested;
	}
	const nestedFormData = generateNested(formData).split(';');
	function getValueForKey(key: string) {
		const keyValuePair = nestedFormData.find((item) => item.startsWith(key + ':'));
		if (keyValuePair) {
			// Extract the value part after the colon
			return keyValuePair.split(':')[1];
		} else {
			return null; // Key not found
		}
	}
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
							value={getValueForKey(`${section}.${field.name}.light`)}
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
							value={getValueForKey(`${section}.${field.name}.dark`)}
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
							value={getValueForKey(`${section}.${field.name}`)}
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
