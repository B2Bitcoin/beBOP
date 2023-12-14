<script lang="ts">
	import type { Specification } from '$lib/types/Specification';
	import { specificationGroupBy } from '$lib/utils/specification';
	import { useI18n } from '$lib/i18n';

	export let specification: Pick<Specification, 'title' | 'content'>;

	let className = '';
	export { className as class };
	let specificationCategory = specificationGroupBy(specification.content);
	const { t } = useI18n();
</script>

<div class="relative mx-auto tagWidget tagWidget-main p-6 rounded {className}">
	<h2 class="text-2xl body-title">{t('widget.specification')}</h2>
	<div class="flex flex-row gap-6 py-3">
		{#each Object.keys(specificationCategory) as category (category)}
			<div class="flex-col grow">
				<h2 class="text-xl body-title">{category}</h2>
				<div class="my-3">
					{#each specificationCategory[category] as { attribute, value } (attribute)}
						<p class="mt-4 uppercase">{attribute}</p>
						<p>{value}</p>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
