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

<div class="mx-auto tagWidget tagWidget-main gap-4 rounded relative {className}">
	<PictureComponent {picture} class="w-full" />
	<div class="flex flex-col text-center justify-center">
		<div
			class="top-6 mx-auto text-center absolute md:top-12 lg:top-28 left-0 bg-[rgba(243,240,240,0.5)]"
		>
			<h2 class="text-sm uppercase md:text-2xl lg:text-5xl">{tag.title}</h2>
		</div>

		<div
			class="text-sm tagWidget-cta font-semibold absolute bottom-0 right-0 text-white md:text-xl lg:text-xl text-center w-auto p-1"
		>
			{tag.cta[0].label}
		</div>
	</div>
</div>
