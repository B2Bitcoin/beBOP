<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import { TinySlider } from 'svelte-tiny-slider';
	import PictureComponent from './Picture.svelte';

	export let pictures: Picture[];
	export let autoplay: number;
	let className = '';
	export { className as class };
	const transitionDuration = 3;
</script>

<div class={className}>
	<TinySlider let:currentIndex transitionDuration>
		{#each pictures as picture, i}
			<div class="flex-row">
				{#if currentIndex === i}
					<a href={picture.slider?.url} target={picture.slider?.openNewTab ? '_blank' : '_self'}>
						<PictureComponent {picture} class="object-fill h-auto w-auto " /></a
					>
				{/if}
			</div>
		{/each}
	</TinySlider>
</div>
