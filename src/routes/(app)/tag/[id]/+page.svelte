<script lang="ts">
	import VariationThreeTemplateWidget from '$lib/components/VariationThreeTemplateWidget.svelte';
	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border py-3 px-3 flex flex-col gap-2">
		<VariationThreeTemplateWidget tag={data.tag} picture={data.pictures[0]} />
	</article>
</main>
