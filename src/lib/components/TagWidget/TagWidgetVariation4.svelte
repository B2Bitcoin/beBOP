<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import type { Tag } from '$lib/types/Tag';
	import PictureComponent from '../Picture.svelte';

	let className = '';
	export { className as class };

	export let tag: Pick<
		Tag,
		'_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'
	>;
	export let picture: Picture | undefined;
</script>

<div
	class="mx-auto tagWidget tagWidget-main flex rounded sm:gap-2 {className} justify-between my-4"
>
	<div class="flex flex-col ml-2">
		<h2 class="text-4xl pb-2 uppercase body-title">{tag.title}</h2>
		<h2 class="text-lg pb-2 md:text-3xl">
			{tag.shortContent}
		</h2>
	</div>

	<div class="relative shrink-0">
		<PictureComponent {picture} class="w-[15em]" />
		{#if tag.cta.length}
			<div class="btn tagWidget-cta text-xl absolute bottom-0 left-0 text-center p-2 m-2">
				<a
					class="tagWidget-hyperlink"
					href={tag.cta[0].href}
					target={tag.cta[0].href.startsWith('http') || tag.cta[0].openNewTab ? '_blank' : '_self'}
					>{tag.cta[0].label}</a
				>
			</div>
		{/if}
	</div>
</div>
