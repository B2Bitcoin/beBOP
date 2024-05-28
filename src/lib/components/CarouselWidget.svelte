<script lang="ts">
	import type { Picture } from '$lib/types/Picture';
	import { TinySlider } from 'svelte-tiny-slider';
	import PictureComponent from './Picture.svelte';
	import { onDestroy, onMount } from 'svelte';

	export let pictures: Picture[];
	export let autoplay: number;
	let className = '';
	export { className as class };
	let currentIndex = 0;
	// Function to move to the next slide
	function nextSlide() {
		currentIndex = (currentIndex + 1) % pictures.length;
	}
	let interval: number;
	onMount(() => {
		interval = Number(setInterval(nextSlide, autoplay));
		return () => clearInterval(interval);
	});
	function setIndex(index: number) {
		currentIndex = index;
		clearInterval(interval);
		setInterval(nextSlide, autoplay);
	}
</script>

<div class={className}>
	<TinySlider {currentIndex} transitionDuration={200}>
		{#each pictures as picture, i}
			<div class="flex-row">
				{#if currentIndex === i}
					<a href={picture.slider?.url} target={picture.slider?.openNewTab ? '_blank' : '_self'}>
						<PictureComponent {picture} class="object-fill h-auto w-auto " /></a
					>
				{/if}
			</div>
		{/each}
		<svelte:fragment slot="controls" let:currentIndex>
			<!-- Pagination Points -->
			<div class="relative bottom-10 mx-auto w-full flex justify-center p-4 space-x-2">
				{#each Array.from({ length: pictures.length }, (_, index) => index) as i}
					<button
						class="w-3 h-3 rounded-full transition-colors duration-300"
						class:body-mainCTA={currentIndex === i}
						class:bg-gray-200={currentIndex !== i}
						on:click={() => setIndex(i)}
					/>
				{/each}
			</div>
		</svelte:fragment>
	</TinySlider>
</div>
