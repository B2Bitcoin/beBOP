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
	<div class="flex-col">
		<div class="tagWidget tagWidget-main m-2 p-4 max-w-[344px]">
			<h2 class="text-2xl body-title pb-2 uppercase">{gallery.principal.title}</h2>
		</div>
		<div class="btn tagWidget-cta text-xl text-center w-auto m-2 p-4 max-w-[344px]">
			<a class="tagWidget-hyperlink" href={gallery.principal.cta.href}
				>{gallery.principal.cta.label}</a
			>
		</div>
		<div class="tagWidget tagWidget-main m-2 p-4 max-w-[344px]">
			<p class="min-h-[600px] mt-2 text-gray-800">
				{gallery.principal.content}
			</p>
		</div>
	</div>
	{#each gallery.secondary as secondary}
		<div class="flex-col">
			<div class="m-2 justify-items-center max-w-[344px]">
				<PictureComponent
					picture={pictureById[secondary.pictureId || '']}
					class="block h-auto w-[344px]"
				/>
			</div>

			<div class="m-2 tagWidget tagWidget-main p-4 text-center max-w-[344px]">
				<h2 class="text-xl body-title pb-2 uppercase">{secondary.title}</h2>
			</div>
			<div class="m-2 tagWidget tagWidget-main p-4 text-center max-w-[344px]">
				<p class="min-h-[285px] mt-2 text-gray-800">
					{secondary.content}
				</p>
			</div>
			<div class="btn tagWidget-cta text-xl text-center w-auto p-4 m-2 max-w-[344px]">
				<a class="tagWidget-hyperlink" href={secondary.cta.href}>{secondary.cta.label}</a>
			</div>
		</div>
	{/each}
</div>
