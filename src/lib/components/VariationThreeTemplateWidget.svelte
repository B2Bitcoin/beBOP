<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import type { Tag } from '$lib/types/Tag';
	import PictureComponent from './Picture.svelte';

	let className = '';
	export { className as class };
	export let tag: Pick<
		Tag,
		'_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'
	>;
	export let picture: Picture | undefined;

	$: baseClasses = 'mx-auto bg-gray-240 gap-4 rounded';
</script>

<div class="{baseClasses} {className}">
	<div>
		<PictureComponent {picture} />

		<div class="flex flex-col my-[-25px] text-center justify-center">
			<div class="mx-auto text-center bg-white">
				<h2 class="text-md uppercase md:text-2xl lg:text-5xl">{tag.title}</h2>
			</div>
			<h2 class="text-lg pb-2">
				{tag.shortContent}
			</h2>
			<div class="flex text-centern justify-evenly mt-auto">
				{#each tag.cta as cta}
					<div class="bg-blue-500 font-semibold text-white text-xl text-center w-auto p-1">
						{cta.label}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.background-image {
		background-image: url(https://imgur.com/rjdvjFT.png);
		background-size: 100%;
		background-repeat: no-repeat;
		background-position: left top;
	}
</style>
