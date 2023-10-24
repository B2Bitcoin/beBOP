<script lang="ts">
	import type { Tag } from '$lib/types/Tag';
	import VariationOneTemplateWidget from './VariationOneTemplateWidget.svelte';

	let className = '';
	export { className as class };
	export let tag: Pick<
		Tag,
		'_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'
	>;

	$: baseClasses = 'mx-auto bg-gray-240 gap-4 rounded';
</script>

<div class="{baseClasses} {className} relative">
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img src="https://imgur.com/rjdvjFT.png" alt="Image" class="w-full h-auto" />
	<div
		class="mt-12 md:mt-[150px] lg:mt-[200px] pb-6 absolute inset-0 flex flex-col items-center justify-center"
	>
		<div class="text-center background-col">
			<h2 class="text-sm md:text-md uppercase md:text-2xl lg:text-5xl">{tag.title}</h2>
		</div>
		<h2 class="text-sm mt-1 md:text-md lg:text-lg lg:mt-4 pb-2 short-content">
			{tag.shortContent}
		</h2>
		<div class="flex text-centern justify-evenly mt-auto">
			{#each tag.cta as cta}
				<div
					class="text-sm bg-blue-500 font-semibold mx-32 text-white md:text-xl text-center w-auto lg:p-1"
				>
					{cta.label}
				</div>
			{/each}
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
	.background-col {
		background-color: rgba(243, 240, 240, 0.5);
	}

	.short-content {
		text-shadow: #000 1px 0 10px;
		color: #fff;
	}
</style>
