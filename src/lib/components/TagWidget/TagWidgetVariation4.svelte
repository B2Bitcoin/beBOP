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

<div class="mx-auto tagWidget tagWidget-main flex rounded sm:gap-2 {className}">
	<div class="flex flex-col ml-2">
		<h2 class="text-4xl pb-2 uppercase body-title">{tag.title}</h2>
		<h2 class="text-lg pb-2 md:text-3xl">
			{tag.shortContent}
		</h2>
	</div>

	<div class="relative">
		<PictureComponent {picture} />
		<div class="tagWidget-cta font-semibold text-xl absolute bottom-0 right-0 text-center p-1 m-2">
			<a class="tagWidget-hyperlink" href={tag.cta[0].href}>{tag.cta[0].label}</a>
		</div>
	</div>
</div>
