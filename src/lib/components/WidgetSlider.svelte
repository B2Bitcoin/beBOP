<script lang="ts">
	import type { WidgetSlider } from '$lib/types/WidgetSlider';

	export let widgetSlider: Pick<WidgetSlider, '_id' | 'title' | 'lines'>;
	let className = '';
	export { className as class };
</script>

{#each widgetSlider.lines as line}
	<div class={className}>{line}</div>
{/each}
