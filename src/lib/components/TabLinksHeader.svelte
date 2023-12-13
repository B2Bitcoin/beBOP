<script lang="ts">
	import { page } from '$app/stores';

	export let tabs: Array<{ name: string; href: string }>;
</script>

<ul
	class="flex flex-wrap text-xl font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400"
>
	{#each tabs as tab}
		<li class="mr-2">
			<a
				href={tab.href}
				class="{$page.url.pathname === tab.href
					? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
					: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
			>
				{tab.name}
			</a>
		</li>
	{/each}
</ul>
