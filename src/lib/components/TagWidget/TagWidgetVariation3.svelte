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

<div class="mx-auto tagWidget tagWidget-main gap-4 rounded {className} relative">
	<PictureComponent {picture} class="w-full h-auto" />
	<div
		class="mt-[100px] md:mt-[300px] lg:mt-[400px] pb-6 absolute inset-0 flex flex-col items-center justify-center"
	>
		<div class="mb-8 text-center bg-[rgba(243,240,240,0.5)] md:mb-16 lg:mb-24">
			<h2 class="text-3xl md:text-md uppercase md:text-6xl lg:text-9xl body-title">{tag.title}</h2>
		</div>
		<div class="text-center">
			<h2 class="text-3xl mt-1 md:text-3xl lg:text-3xl px-6 lg:mt-4 pb-2">
				{tag.shortContent}
			</h2>
		</div>
		<div class="flex text-center justify-evenly mt-auto">
			{#each tag.cta as cta}
				<div
					class="text-4xl tagWidget-cta font-semibold mx-20 md:text-4xl text-center w-auto p-1 hidden sm:inline"
				>
					<a class="tagWidget-hyperlink" href="{cta.href}">{cta.label}</a>
				</div>
				<div class="text-xl tagWidget-cta font-semibold mx-1 sm:hidden text-center p-1">
					<a class="tagWidget-hyperlink" href="{cta.href}">{cta.label}</a>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.short-content {
		text-shadow: #000 1px 0 10px;
		color: #fff;
	}
</style>
