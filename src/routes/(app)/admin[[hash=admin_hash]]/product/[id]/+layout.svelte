<script lang="ts">
	import { page } from '$app/stores';

	export let data;
</script>

<!-- <h1 class="text-3xl">Edit a product</h1> -->

<ul
	class="flex flex-wrap text-xl font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400"
>
	<li class="mr-2">
		<a
			href="{data.adminPrefix}/product/{data.product._id}"
			class="{$page.url.pathname === `${data.adminPrefix}/product/${data.product._id}`
				? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
				: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
		>
			Edit a product
		</a>
	</li>
	<li class="mr-2">
		<a
			href="{data.adminPrefix}/product/{data.product._id}/translations"
			class="{$page.url.pathname === `${data.adminPrefix}/product/${data.product._id}/translations`
				? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
				: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
		>
			Translations
		</a>
	</li>
	{#if data.product.type === 'subscription'}
		<li class="mr-2">
			<a
				href="{data.adminPrefix}/product/{data.product._id}/subscribers"
				class="{$page.url.pathname === `${data.adminPrefix}/product/${data.product._id}/subscribers`
					? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
					: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
			>
				Subscribers
			</a>
		</li>
	{/if}
</ul>

<slot />
