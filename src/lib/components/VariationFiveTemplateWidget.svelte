<script lang="ts">
	import type { Tag } from '$lib/types/Tag';

	let className = '';
	export { className as class };

	export let tag: Pick<
		Tag,
		'_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'
	>;

	$: baseClasses = 'mx-auto bg-gray-240 flex rounded sm:gap-2';
</script>

<div class="{baseClasses} {className}">
	<div class="flex flex-col text-end">
		<h2 class="text-4xl pb-2 uppercase">{tag.title}</h2>
		<h2 class="text-lg pb-2 md:text-3xl">
			{tag.shortContent}
		</h2>
	</div>

	<div class="relative">
		<img src="https://i.imgur.com/vUISISW.png" alt="Image" />
		<div class="flex text-centern justify-between mt-auto">
			{#each tag.cta as cta}
				<div class="bg-blue-500 font-semibold text-white text-xl text-center w-auto p-1">
					{cta.label}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.background-image {
		background-size: cover 100%;
		background-repeat: no-repeat;
		background-position: left top;
	}
</style>
