<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import type { Tag } from '$lib/types/Tag';
	import { typedInclude } from '$lib/utils/typedIncludes';
	import { typedKeys } from '$lib/utils/typedKeys';
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

	const widgets = {
		'var-1': {
			component: VariationOneTemplateWidget,
			pictureType: 'full'
		},
		'var-2': {
			component: VariationTwoTemplateWidget,
			pictureType: 'wide'
		},
		'var-3': {
			component: VariationThreeTemplateWidget,
			pictureType: 'main'
		},
		'var-4': {
			component: VariationFourTemplateWidget,
			pictureType: 'avatar'
		},
		'var-5': {
			component: VariationFiveTemplateWidget,
			pictureType: 'slim'
		},
		'var-6': {
			component: VariationSixTemplateWidget,
			pictureType: 'slim'
		}
	};

	$: widget = typedInclude(typedKeys(widgets), displayOption) ? widgets[displayOption] : null;
</script>

{#if widget}
	<svelte:component
		this={widget.component}
		{tag}
		picture={pictures.find((picture) => picture.tag?.type === widget?.pictureType)}
		avatar={pictures.find((picture) => picture.tag?.type === 'avatar')}
		class={className}
	/>
{/if}
