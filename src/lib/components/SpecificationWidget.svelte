<script lang="ts">
	import type { Specification } from '$lib/types/Specification';
	import { specificationGroupBy } from '$lib/utils/specification';

	export let specification: Pick<Specification, 'title' | 'content'>;

	let className = '';
	export { className as class };
	let specificationCategory = specificationGroupBy(specification.content);
</script>

<div class="relative mx-auto tagWidget tagWidget-main flex flex-row gap-4 p-6 rounded {className}">
	{#each Object.keys(specificationCategory) as category (category)}
		<div class="flex-col mx-auto">
			<h2 class="text-xl body-title">{category}</h2>
			<br />
			<ul>
				{#each specificationCategory[category] as { attribute, value } (attribute)}
					<li>{attribute}</li>
					<li>{value}</li>
					<br />
				{/each}
			</ul>
		</div>
	{/each}
</div>
