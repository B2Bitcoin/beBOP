<script lang="ts">
	import type { Tag } from '$lib/types/Tag';
	import type { Picture } from '$lib/types/Picture';
	import PictureComponent from '../Picture.svelte';
	import VariationFourTemplateWidget from './TagWidgetVariation4.svelte';

	let className = '';
	export { className as class };

	export let tag: Pick<
		Tag,
		'_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'
	>;
	export let picture: Picture | undefined;
	export let avatar: Picture | undefined;
</script>

<div class="hidden sm:inline">
	<div class="flex mt-12 mb-12">
		<div class="mx-auto background tagWidget-main flex rounded sm:gap-2 {className}">
			<div class="flex flex-col text-end w-[50%]">
				<h2 class="text-4xl pb-2 uppercase">{tag.title}</h2>
				<h2 class="text-md md:text-xl">
					{tag.content}
				</h2>
				<div class="flex text-centern justify-between mt-auto">
					{#each tag.cta as cta}
						<div class="tagWidget-cta font-semibold text-white text-xl text-center w-auto p-1">
							{cta.label}
						</div>
					{/each}
				</div>
			</div>

			<div class="flex w-[50%]">
				<PictureComponent {picture} class="w-auto h-full object-cover" />
			</div>
		</div>
	</div>
</div>

<svelte:component
	this={VariationFourTemplateWidget}
	{tag}
	picture={avatar}
	class="{className} sm:hidden"
/>
