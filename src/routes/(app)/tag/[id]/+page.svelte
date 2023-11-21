<script lang="ts">
	import TagWidget from '$lib/components/TagWidget.svelte';

	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article
		class="w-full rounded-xl body-secondPlan border-gray-300 border py-3 px-3 flex flex-col gap-2"
	>
		<TagWidget tag={data.tag} displayOption="var-1" pictures={data.pictures} />
		<TagWidget tag={data.tag} displayOption="var-2" pictures={data.pictures} />
		<TagWidget tag={data.tag} displayOption="var-3" pictures={data.pictures} />
		<TagWidget tag={data.tag} displayOption="var-4" pictures={data.pictures} />
		<TagWidget tag={data.tag} displayOption="var-5" pictures={data.pictures} />
		<TagWidget tag={data.tag} displayOption="var-6" pictures={data.pictures} />
	</article>
</main>
