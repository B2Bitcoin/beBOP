<script lang="ts">
	import VariationFiveTemplateWidget from '$lib/components/VariationFiveTemplateWidget.svelte';
	import VariationFourTemplateWidget from '$lib/components/VariationFourTemplateWidget.svelte';
	import VariationOneTemplateWidget from '$lib/components/VariationOneTemplateWidget.svelte';
	import VariationSixTemplateWidget from '$lib/components/VariationSixTemplateWidget.svelte';
	import VariationThreeTemplateWidget from '$lib/components/VariationThreeTemplateWidget.svelte';
	import VariationTwoTemplateWidget from '$lib/components/VariationTwoTemplateWidget.svelte';

	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border py-3 px-3 flex flex-col gap-2">
		<VariationOneTemplateWidget
			tag={data.tag}
			picture={data.pictures.find((picture) => picture.tag?.type === 'full')}
			avatar={data.pictures.find((picture) => picture.tag?.type === 'avatar')}
		/>

		<VariationTwoTemplateWidget
			tag={data.tag}
			picture={data.pictures.find((picture) => picture.tag?.type === 'wide')}
			class="not-prose"
		/>
		<VariationThreeTemplateWidget
			tag={data.tag}
			picture={data.pictures.find((picture) => picture.tag?.type === 'main')}
			class="not-prose"
		/>
		<VariationFourTemplateWidget
			tag={data.tag}
			picture={data.pictures.find((picture) => picture.tag?.type === 'avatar')}
			class="not-prose"
		/>
		<VariationFiveTemplateWidget
			tag={data.tag}
			picture={data.pictures.find((picture) => picture.tag?.type === 'slim')}
			class="not-prose"
		/>
		<VariationSixTemplateWidget
			tag={data.tag}
			picture={data.pictures.find((picture) => picture.tag?.type === 'slim')}
			class="not-prose"
		/>
	</article>
</main>
