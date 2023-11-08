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
	<div class="flex flex-col">
		<h2 class="text-4xl pb-2 uppercase">{tag.title}</h2>
		<h2 class="text-lg pb-2 md:text-3xl">
			{tag.shortContent}
		</h2>
	</div>

	<div class="relative">
		<!-- svelte-ignore a11y-img-redundant-alt -->
		<img src="https://i.imgur.com/vUISISW.png" alt="Image" />
		<div
			class="bg-blue-500 font-semibold text-white text-xl absolute bottom-0 right-0 text-center p-1"
		>
			{tag.cta[0].label}
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
