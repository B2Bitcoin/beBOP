<script lang="ts">
	import type { Specification } from '$lib/types/Specification';
	import { specificationGroupBy } from '$lib/utils/specification';
	import { useI18n } from '$lib/i18n';
	import { TinySlider } from 'svelte-tiny-slider';

	export let specification: Pick<Specification, 'title' | 'content'>;

	let className = '';
	export { className as class };
	let specificationCategory = specificationGroupBy(specification.content);
	const { t } = useI18n();
</script>

<div class="relative mx-auto tagWidget tagWidget-main p-6 rounded {className}">
	<h2 class="text-2xl body-title">{t('widget.specification')}</h2>
	<div class="hidden lg:flex flex-row gap-6 py-3">
		{#each Object.keys(specificationCategory) as category (category)}
			<div class="flex-col grow basis-0">
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
	<div class="flex lg:hidden flex-row gap-6 py-3">
		<TinySlider let:currentIndex>
			{#each Object.keys(specificationCategory) as category, i (category)}
				<div class="flex-wrap">
					{#if currentIndex === i}
						<div class="flex-row">
							<h2 class="text-xl body-title">{category}</h2>
							<div class="my-3">
								{#each specificationCategory[category] as { attribute, value } (attribute)}
									<p class="mt-4 uppercase">{attribute}</p>
									<p>{value}</p>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
			<svelte:fragment slot="controls" let:setIndex let:currentIndex>
				<div class="absolute inset-y-0 left-0 flex items-center px-2">
					{#if currentIndex > 0}
						<button
							class="bg-gray-500 hover:bg-gray-300 px-3 py-2 rounded-full"
							on:click={() => setIndex(currentIndex - 1)}>&#9664;</button
						>
					{/if}
				</div>
				<div class="absolute inset-y-0 right-0 flex items-center px-2">
					{#if currentIndex < Object.keys(specificationCategory).length - 1}
						<button
							class="bg-gray-500 hover:bg-gray-300 px-3 py-2 rounded-full"
							on:click={() => setIndex(currentIndex + 1)}>&#9654;</button
						>
					{/if}
				</div>
			</svelte:fragment>
		</TinySlider>
	</div>
</div>
