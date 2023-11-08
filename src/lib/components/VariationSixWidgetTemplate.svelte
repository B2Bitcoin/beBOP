<script lang="ts">
	import type { Tag } from '$lib/types/Tag';

	let className = '';
	export { className as class };
	export let tag: Pick<
		Tag,
		'_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'
	>;

	$: baseClasses = 'mx-auto bg-gray-240 gap-4 rounded relative';
</script>

<div class="{baseClasses} {className}">
	<img src="https://i.imgur.com/mwi2zTi.png" alt="img watch" class="w-full" />
	<div class="flex flex-col text-center justify-center">
		<div class="top-4 mx-auto text-center absolute lg:top-28 right-0 background-color">
			<h2 class="text-sm uppercase md:text-2xl lg:text-5xl">{tag.title}</h2>
		</div>
		<div class="flex justify-evenly py-4 items-center">
			<div class="bg-blue-500 font-semibold text-white text-xl text-center w-auto p-1">
				{tag.cta[0].label}
			</div>
			<h2 class="text-lg pb-2">
				{tag.shortContent}
			</h2>
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
	.background-color {
		background-color: rgba(243, 240, 240, 0.5);
	}
</style>
