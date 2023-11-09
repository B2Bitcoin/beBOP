<script lang="ts">
	import ChallengeWidget from './ChallengeWidget.svelte';
	import CarouselWidget from './CarouselWidget.svelte';
	import type { Challenge } from '$lib/types/Challenge';
	import type { Slider } from '$lib/types/slider';
	import type { Picture } from '$lib/types/Picture';

	export let challenges: Challenge[];
	export let tokens: Array<
		| {
				type: 'html';
				raw: string;
		  }
		| {
				type: 'challengeWidget';
				slug: string;
				raw: string;
		  }
		| {
				type: 'sliderWidget';
				slug: string;
				autoplay: number | undefined;
				raw: string;
		  }
	> = [];
	export let sliders: Slider[];
	export let slidersPictures: Picture[];

	$: challengeById = Object.fromEntries(challenges.map((challenge) => [challenge._id, challenge]));
	$: sliderById = Object.fromEntries(sliders.map((slider) => [slider._id, slider]));
	function picturesBySlider(sliderId: string) {
		return slidersPictures.filter((picture) => picture.slider?._id === sliderId);
	}
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border p-6">
		<div class="prose max-w-full">
			{#each tokens as token}
				{#if token.type === 'challengeWidget' && challengeById[token.slug]}
					<ChallengeWidget challenge={challengeById[token.slug]} class="my-5" />
				{:else if token.type === 'sliderWidget' && sliderById[token.slug]}
					<CarouselWidget
						autoplay={token.autoplay ? token.autoplay : 3000}
						pictures={picturesBySlider(token.slug)}
					/>
				{:else}
					{@html token.raw}
				{/if}
			{/each}
		</div>
	</article>
</main>
