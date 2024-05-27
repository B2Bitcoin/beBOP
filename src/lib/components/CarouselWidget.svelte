<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import { TinySlider } from 'svelte-tiny-slider';
	import PictureComponent from './Picture.svelte';
	import { fade } from 'svelte/transition';

	export let pictures: Picture[];
	export let autoplay: number;
	let className = '';
	export { className as class };
</script>

<div class={className}>
	<TinySlider let:currentIndex>
		{#each pictures as picture, i}
			<div class="flex-row" transition:fade={{ duration: autoplay }}>
				{#if currentIndex === i}
					<a href={picture.slider?.url} target={picture.slider?.openNewTab ? '_blank' : '_self'}>
						<PictureComponent {picture} class="object-fill h-auto w-auto " /></a
					>
				{/if}
			</div>
		{/each}
	</TinySlider>
</div>
