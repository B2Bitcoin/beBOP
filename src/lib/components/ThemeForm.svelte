<script lang="ts">
	import { themeFormStructure, type Theme, systemFonts } from '$lib/types/Theme';
	import { get } from 'lodash-es';

	export let theme: Theme | null = null;

	function getValueForKey(key: string) {
		return get(theme, key) ?? '';
	}
</script>

{#each Object.entries(themeFormStructure) as [section, fields]}
	<h2 class="text-2xl">{fields.label}</h2>
	{#each fields.elements as field}
		{#if field.name.endsWith('color') || field.name.endsWith('Color')}
			<label class="form-label">
				{field.label} (light)
				<input
					class="form-input"
					type="color"
					name={`${section}.${field.name}.light`}
					placeholder="#FFFFFF"
					required
					value={getValueForKey(`${section}.${field.name}.light`)}
				/>
			</label>
			<label class="form-label">
				{field.label} (dark)
				<input
					class="form-input"
					type="color"
					name={`${section}.${field.name}.dark`}
					placeholder="#000000"
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
					placeholder="Arial; Helvetica; sans-serif"
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
