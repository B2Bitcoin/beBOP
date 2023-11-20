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

<div class="mx-auto tagWidget-main rounded {className}">
	<div>
		<PictureComponent {picture} class="w-full" />

		<div class="flex flex-col my-[-25px] text-center justify-center">
			<div class="mx-auto text-center bg-white">
				<h2 class="text-md uppercase md:text-2xl lg:text-5xl">{tag.title}</h2>
			</div>
			<h2 class="text-lg pb-2">
				{tag.shortContent}
			</h2>
			<div class="flex text-centern justify-evenly mt-auto">
				{#each tag.cta as cta}
					<div class="tagWidget-cta font-semibold text-white text-xl text-center w-auto p-1">
						{cta.label}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
