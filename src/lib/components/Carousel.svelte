<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import TinyGesture from 'tinygesture';

	let carousel: HTMLDivElement;
	let carouselContent: HTMLDivElement;
	let carouselDots: HTMLDivElement;
	let currentIndex = 0;
	let dots = 0;
	let trigger = 1;
	let className = '';
	export { className as class };

	let destroyCb = () => {};

	onDestroy(() => destroyCb());

	onMount(async () => {
		dots = carouselContent.children.length;

		for (let i = 0; i < dots; i++) {
			carouselContent.children.item(i)?.addEventListener('click', (item) => (currentIndex = i));
		}

		// So the dots have time to populate
		setTimeout(() => trigger++);

		window.addEventListener('keydown', (key) => {
			switch (key.code) {
				case 'ArrowRight':
					currentIndex = (currentIndex + 1) % dots;
					key.stopPropagation();
					break;
				case 'ArrowLeft':
					currentIndex = (currentIndex + dots - 1) % dots;
					key.stopPropagation();
					break;
			}
		});

		const gesture = new TinyGesture(carousel);
		gesture.on('swipeleft', () => (currentIndex = (currentIndex + 1) % dots));
		gesture.on('swiperight', () => (currentIndex = (currentIndex + dots - 1) % dots));

		destroyCb = () => {
			gesture.off('swiperight', () => (currentIndex = (currentIndex + 1) % dots));
			gesture.off('swipeleft', () => (currentIndex = (currentIndex + 1) % dots));
			gesture.destroy();
		};
	});

	$: if (carouselContent && dots && trigger) {
		if (window.innerWidth >= 640) {
			carouselContent.style.marginLeft = `${25 - currentIndex * 50}%`;
		} else {
			carouselContent.style.marginLeft = `${5 - currentIndex * 90}%`;
		}

		for (let i = 0; i < dots; i++) {
			if (i === currentIndex) {
				carouselDots.children.item(i)?.classList.add('carousel-dot-active');
				carouselContent.children.item(i)?.classList.add('carousel-item-active');
			} else {
				carouselDots.children.item(i)?.classList.remove('carousel-dot-active');
				carouselContent.children.item(i)?.classList.remove('carousel-item-active');
			}
		}
	}
</script>

<div class="flex flex-col overflow-x-hidden {className}" {...$$restProps} bind:this={carousel}>
	<div
		class="flex flex-row w-full carousel-content"
		style="height: calc(100% - 3rem)"
		bind:this={carouselContent}
	>
		<slot />
	</div>

	<div
		style="height: 1rem; margin: 2rem"
		class="flex justify-center carousel-dots"
		bind:this={carouselDots}
	>
		{#each Array(dots) as dot, i}
			<button
				style="width: 1rem; height: 1rem"
				class="rounded-full mx-1 bg-blue-500"
				on:click={() => (currentIndex = i)}
			/>
		{/each}
	</div>
</div>

<style>
	.carousel-content {
		margin-left: -25%;
		transition-property: margin-left;
		transition-duration: 400ms;
	}

	:global(.carousel-content > *) {
		width: 50%;
		min-width: 50%;
		max-height: 100%;
		transition-property: transform, opacity;
		transition-duration: 400ms;
	}

	@media (max-width: 639.9px) {
		:global(.carousel-content > *) {
			width: 90%;
			min-width: 90%;
			max-height: 100%;
			transition-property: transform, opacity;
			transition-duration: 400ms;
		}
	}

	:global(.carousel-content > :not(.carousel-item-active)) {
		transform: scale(0.7);
		opacity: 0.8;
		cursor: pointer;
	}

	.carousel-dots > * {
		transition-property: transform, opacity;
		transition-duration: 400ms;
	}

	.carousel-dots > :not(.carousel-dot-active) {
		transform: scale(0.7);
		opacity: 0.8;
		cursor: pointer;
	}
</style>
