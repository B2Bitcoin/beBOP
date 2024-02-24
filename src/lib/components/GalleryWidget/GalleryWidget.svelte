<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import type { Gallery } from '$lib/types/Gallery';
	import PictureComponent from '../Picture.svelte';

	export let pictures: Picture[];
	export let gallery: Pick<Gallery, '_id' | 'name' | 'principal' | 'secondary'>;
	export let displayOption = 'var-1';

	let className = '';
	export { className as class };
	$: pictureById = Object.fromEntries(pictures.map((picture) => [picture._id, picture]));
</script>

<!-- flex-row-reverse -->
<div
	class="mx-auto flex rounded justify-center {className} {displayOption === 'var-2'
		? 'flex-row-reverse'
		: ''}"
>
	<div class="flex-col w-[34%]">
		<div class="tagWidget tagWidget-main m-2 p-4">
			<h2 class="text-2xl body-title pb-2 uppercase">{gallery.principal.title}</h2>
		</div>
		<div class="btn tagWidget-cta text-xl text-center w-auto m-2 p-4">
			<a class="tagWidget-hyperlink" href={gallery.principal.cta.href}
				>{gallery.principal.cta.label}</a
			>
		</div>
		<div class="tagWidget tagWidget-main m-2 p-4">
			<p class="min-h-[37em] mt-2">
				{gallery.principal.content}
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
					{secondary.content}
				</p>
			</div>
			<div class="btn tagWidget-cta text-xl text-center w-auto p-4 m-2">
				<a class="tagWidget-hyperlink" target="_blank" href={secondary.cta.href}>{secondary.cta.label}</a>
			</div>
		</div>
	{/each}
</div>
