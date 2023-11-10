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

<div class="mx-auto bg-gray-240 gap-4 rounded {className} relative">
	<PictureComponent {picture} class="w-full h-auto" />
	<div
		class="mt-16 mt-[100px] md:mt-[300px] lg:mt-[400px] pb-6 absolute inset-0 flex flex-col items-center justify-center"
	>
		<div class="mb-8 text-center bg-[rgba(243,240,240,0.5)] md:mb-16 lg:mb-24">
			<h2 class="text-3xl md:text-md uppercase md:text-4xl lg:text-6xl">{tag.title}</h2>
		</div>
		<div class="text-center">
			<h2 class="text-2xl mt-1 md:text-xl lg:text-3xl px-6 lg:mt-4 pb-2 short-content">
				{tag.shortContent}
			</h2>
		</div>
		<div class="flex text-center justify-evenly mt-auto">
			{#each tag.cta as cta}
				<div
					class="text-xl bg-blue-500 font-semibold mx-20 text-white md:text-xl text-center w-auto p-1 hidden sm:inline"
				>
					{cta.label}
				</div>
				<div class="text-xl bg-blue-500 font-semibold mx-1 sm:hidden text-white text-center p-1">
					{cta.label}
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
