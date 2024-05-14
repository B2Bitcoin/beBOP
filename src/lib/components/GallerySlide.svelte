<script lang="ts">
	import { TinySlider } from 'svelte-tiny-slider';
	import type { Picture } from '$lib/types/Picture';
	import type { Gallery } from '$lib/types/Gallery';
	import PictureComponent from './Picture.svelte';
	import { marked } from 'marked';

	export let pictures: Picture[];
	export let gallery: Pick<Gallery, '_id' | 'name' | 'principal' | 'secondary'>;
	export let displayOption = 'var-1';

	let className = '';
	export { className as class };
	$: pictureById = Object.fromEntries(pictures.map((picture) => [picture._id, picture]));
</script>

<div
	class="mx-auto flex rounded justify-center {className} {displayOption === 'var-2'
		? 'flex-row-reverse'
		: ''}"
>
	<TinySlider let:currentIndex>
		{#each Array.from({ length: gallery.secondary.length }, (_, index) => index) as i}
			<div class=" flex-wrap">
				{#if currentIndex === i}
					<div class="flex-col w-[100%]">
						<div class="m-2 justify-items-center">
							<PictureComponent
								picture={pictureById[gallery.secondary[i].pictureId || '']}
								class="block h-auto w-auto"
							/>
						</div>

						<div class="m-2 tagWidget tagWidget-main p-4 text-center">
							<h2 class="text-xl body-title pb-2 uppercase min-h-[4em]">
								{gallery.secondary[i].title}
							</h2>
						</div>
						<div class="m-2 tagWidget tagWidget-main p-4 text-center">
							<p class="min-h-[12em] mt-2">
								<!-- eslint-disable svelte/no-at-html-tags -->
								{@html marked(gallery.secondary[i].content.replaceAll('<', '&lt;'))}
							</p>
						</div>
						<div class="btn tagWidget-cta text-xl text-center w-auto p-4 m-2">
							<a
								class="tagWidget-hyperlink"
								href={gallery.secondary[i].cta.href}
								target={gallery.secondary[i].cta.href.startsWith('http') ||
								gallery.secondary[i].cta.openNewTab
									? '_blank'
									: '_self'}>{gallery.secondary[i].cta.label}</a
							>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</TinySlider>
</div>
