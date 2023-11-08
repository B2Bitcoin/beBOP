<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import type { Tag } from '$lib/types/Tag';
	import VariationFiveTemplateWidget from './VariationFiveTemplateWidget.svelte';
	import VariationFourTemplateWidget from './VariationFourTemplateWidget.svelte';
	import VariationOneTemplateWidget from './VariationOneTemplateWidget.svelte';
	import VariationSixTemplateWidget from './VariationSixTemplateWidget.svelte';
	import VariationThreeTemplateWidget from './VariationThreeTemplateWidget.svelte';
	import VariationTwoTemplateWidget from './VariationTwoTemplateWidget.svelte';

	let className = '';
	export { className as class };
	export let tag: Pick<
		Tag,
		'_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'
	>;
	export let pictures: Picture[];
	export let displayOption = 'var-1';
</script>

{#if displayOption === 'var-1'}
	<VariationOneTemplateWidget
		{tag}
		picture={pictures.find((picture) => picture.tag?.type === 'avatar')}
		class={className}
	/>
{/if}
{#if displayOption === 'var-2'}
	<VariationTwoTemplateWidget
		{tag}
		picture={pictures.find((picture) => picture.tag?.type === 'wide')}
		class={className}
	/>
{/if}
{#if displayOption === 'var-3'}
	<VariationThreeTemplateWidget
		{tag}
		picture={pictures.find((picture) => picture.tag?.type === 'main')}
		class={className}
	/>
{/if}
{#if displayOption === 'var-4'}
	<VariationFourTemplateWidget
		{tag}
		picture={pictures.find((picture) => picture.tag?.type === 'avatar')}
		class={className}
	/>
{/if}
{#if displayOption === 'var-5'}
	<VariationFiveTemplateWidget
		{tag}
		picture={pictures.find((picture) => picture.tag?.type === 'slim')}
		class={className}
	/>
{/if}
{#if displayOption === 'var-6'}
	<VariationSixTemplateWidget
		{tag}
		picture={pictures.find((picture) => picture.tag?.type === 'slim')}
		class={className}
	/>
{/if}
