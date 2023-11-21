<script lang="ts">
	import { page } from '$app/stores';
	import { useI18n } from '$lib/i18n';

	const { t } = useI18n();
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article
		class="w-full rounded-xl body-secondPlan border-gray-300 border py-3 px-3 gap-4 flex flex-col text-center"
	>
		<h1 class="text-3xl">{t('error.title', { status: $page.error?.status ?? $page.status })}</h1>
		<h2 class="text-2xl">{$page.error?.message}</h2>
	</article>
</main>
