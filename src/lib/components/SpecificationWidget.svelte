<script lang="ts">
	import type { Specification } from '$lib/types/Specification';
	import { specificationGroupBy } from '$lib/utils/specification';
	import { upperCase } from 'lodash-es';

	export let specification: Pick<Specification, 'title' | 'content'>;

	let className = '';
	export { className as class };
	let specificationCategory = specificationGroupBy(specification.content);
</script>

<div class="relative mx-auto tagWidget tagWidget-main p-6 rounded {className}">
	<div class="flex flex-row">
		<h2 class="text-2xl body-title">Specification</h2>
	</div>
	<div class="flex flex-row gap-6">
		{#each Object.keys(specificationCategory) as category (category)}
			<div class="flex-col">
				<h2 class="text-xl body-title">{category}</h2>
				<ul class="my-3">
					{#each specificationCategory[category] as { attribute, value } (attribute)}
						<li class="mt-4">{upperCase(attribute)}</li>
						<li>{value}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</div>
