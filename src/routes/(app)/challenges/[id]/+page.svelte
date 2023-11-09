<script lang="ts">
	import ChallengeWidget from '$lib/components/ChallengeWidget.svelte';
	import { t, useI18n } from '$lib/i18n.js';

	useI18n();

	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border py-3 px-3 flex flex-col gap-2">
		<h1 class="text-3xl">{t('challenge.singleTitle', { name: data.challenge.name })}</h1>
		<ChallengeWidget challenge={data.challenge} />
	</article>
</main>
