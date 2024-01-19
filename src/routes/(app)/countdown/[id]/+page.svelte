<script lang="ts">
	import CountdownWidget from '$lib/components/CountdownWidget.svelte';

	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article
		class="w-full rounded-xl body-secondPlan border-gray-300 border py-3 px-3 flex flex-col gap-2"
	>
		<CountdownWidget countdown={data.countdown} />
	</article>
</main>
