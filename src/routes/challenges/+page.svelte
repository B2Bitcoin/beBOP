<script lang="ts">
	import { page } from '$app/stores';
	import { marked } from 'marked';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { applyAction, enhance } from '$app/forms';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';
	import GoalProgress from '$lib/components/GoalProgress.svelte';
	import { productAddedToCart } from '$lib/stores/productAddedToCart';
	import { invalidate } from '$app/navigation';
	import { UrlDependency } from '$lib/types/UrlDependency';

	export let data;
</script>

<svelte:head>
	<title>challenge</title>
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border py-3 px-3">
		<div class=" w-12 min-w-[400px] py-12">
			{#each data.challenge as chal, i}
				<a href={'challenges/' + chal._id}>
					{chal.name}
				</a>
			{/each}
		</div>
	</article>
</main>
