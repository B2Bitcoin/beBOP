<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import type { Gallery } from '$lib/types/Gallery';
	import PictureComponent from '../Picture.svelte';
	import { marked } from 'marked';
	import { TinySlider } from 'svelte-tiny-slider';

	export let pictures: Picture[];
	export let gallery: Pick<Gallery, '_id' | 'name' | 'principal' | 'secondary'>;
	export let displayOption = 'var-1';

	let className = '';
	export { className as class };
	$: pictureById = Object.fromEntries(pictures.map((picture) => [picture._id, picture]));
</script>

<div
	class="mx-auto hidden lg:flex rounded justify-center {className} {displayOption === 'var-2'
		? 'flex-row-reverse'
		: ''}"
>
	<div class="flex-col w-[34%]">
		<div class="tagWidget tagWidget-main m-2 p-4">
			<h2 class="text-2xl body-title pb-2 uppercase">{gallery.principal.title}</h2>
		</div>
		<div class="btn tagWidget-cta text-xl text-center w-auto m-2 p-4">
			<a
				class="tagWidget-hyperlink"
				href={gallery.principal.cta.href}
				target={gallery.principal.cta.href.startsWith('http') || gallery.principal.cta.openNewTab
					? '_blank'
					: '_self'}>{gallery.principal.cta.label}</a
			>
		</div>
		<div class="tagWidget tagWidget-main m-2 p-4">
			<p class="min-h-[37em] mt-2">
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html marked(gallery.principal.content.replaceAll('<', '&lt;'))}
			</p>
		</div>
	</div>
	{#each gallery.secondary as secondary}
		<div class="flex-col w-[22%]">
			<div class="m-2 justify-items-center">
				<PictureComponent
					picture={pictureById[secondary.pictureId || '']}
					class="block h-auto w-auto"
				/>
			</div>

			<div class="m-2 tagWidget tagWidget-main p-4 text-center">
				<h2 class="text-xl body-title pb-2 uppercase min-h-[4em]">{secondary.title}</h2>
			</div>
			<div class="m-2 tagWidget tagWidget-main p-4 text-center">
				<p class="min-h-[12em] mt-2">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked(secondary.content.replaceAll('<', '&lt;'))}
				</p>
			</div>
			<div class="btn tagWidget-cta text-xl text-center w-auto p-4 m-2">
				<a
					class="tagWidget-hyperlink"
					href={secondary.cta.href}
					target={secondary.cta.href.startsWith('http') || secondary.cta.openNewTab
						? '_blank'
						: '_self'}>{secondary.cta.label}</a
				>
			</div>
		</div>
	{/each}
</div>

<div
	class="mx-auto lg:hidden flex rounded justify-center {className} {displayOption === 'var-2'
		? 'flex-row-reverse'
		: ''}"
>
	<TinySlider let:currentIndex>
		{#each Array.from({ length: gallery.secondary.length }, (_, index) => index) as i}
			<div class="flex-wrap">
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

		<svelte:fragment slot="controls" let:setIndex let:currentIndex>
			<div class="absolute inset-y-0 left-0 flex items-center px-2">
				{#if currentIndex > 0}
					<button
						class="bg-gray-400 hover:bg-gray-300 px-3 py-2 rounded-full"
						on:click={() => setIndex(currentIndex - 1)}>&#9664;</button
					>
				{/if}
			</div>
			<div class="absolute inset-y-0 right-0 flex items-center px-2">
				{#if currentIndex < gallery.secondary.length - 1}
					<button
						class="bg-gray-400 hover:bg-gray-300 px-3 py-2 rounded-full"
						on:click={() => setIndex(currentIndex + 1)}>&#9654;</button
					>
				{/if}
			</div>
		</svelte:fragment>
	</TinySlider>
</div>
