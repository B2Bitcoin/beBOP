<script lang="ts">
	import { themeFormStructure, type Theme, systemFonts } from '$lib/types/Theme';
	import { get } from 'lodash-es';

	export let theme: Theme | null = null;

	function getValueForKey(key: string) {
		return get(theme, key);
	}
</script>

{#each Object.entries(themeFormStructure) as [section, fields]}
	<h2 class="text-2xl">{fields.label}</h2>
	{#each fields.elements as field}
		{#if field.name.endsWith('color') || field.name.endsWith('Color')}
			<div class="flex gap-2 w-full">
				<label class="form-label grow">
					{field.label} (light)
					<input
						class="form-input"
						type="color"
						name={`${section}.${field.name}.light`}
						required
						value={getValueForKey(`${section}.${field.name}.light`) ??
						field.name.endsWith('backgroundColor')
							? '#FFFFFF'
							: '#000000'}
					/>
				</label>
				<label class="form-label grow">
					{field.label} (dark)
					<input
						class="form-input"
						type="color"
						name={`${section}.${field.name}.dark`}
						required
						value={getValueForKey(`${section}.${field.name}.dark`) ??
						!field.name.endsWith('backgroundColor')
							? '#FFFFFF'
							: '#000000'}
					/>
				</label>
			</div>
		{:else}
			<label class="form-label">
				{field.label}
				<select
					class="form-input"
					name={`${section}.${field.name}`}
					required
					value={getValueForKey(`${section}.${field.name}`) ?? 'Outfit'}
				>
					{#each systemFonts as font}
						<option value={font}>{font}</option>
					{/each}
				</select>
			</label>
		{/if}
	{/each}
{/each}
