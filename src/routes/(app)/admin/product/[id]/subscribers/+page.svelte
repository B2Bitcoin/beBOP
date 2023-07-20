<script lang="ts">
	import PictureComponent from '$lib/components/Picture.svelte';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays } from 'date-fns';
	import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
	import { CURRENCIES, SATOSHIS_PER_BTC } from '$lib/types/Currency';
	import DeliveryFeesSelector from '$lib/components/DeliveryFeesSelector.svelte';
	import { page } from '$app/stores';
	import { subscribe } from 'svelte/internal';

	export let data;
</script>

<!-- <h1 class="text-3xl">Edit a product</h1> -->

<ul
	class="flex flex-wrap text-xl font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400"
>
	<li class="mr-2">
		<a
			href="/admin/product/{data.product._id}"
			class="{$page.url.pathname === '/admin/product/' + data.product._id
				? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
				: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
			>Edit a product</a
		>
	</li>
	<li class="mr-2">
		<a
			href="/admin/product/{data.product._id}/subscribers"
			class="{$page.url.pathname === '/admin/product/' + data.product._id + '/subscribers'
				? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
				: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
			>Subscribers</a
		>
	</li>
</ul>

<div class="container mx-auto p-4">
	<table class="min-w-full divide-y divide-gray-200">
		<thead>
			<tr>
				<th
					class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider"
				>
					order
				</th>
				<th
					class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider"
				>
					id
				</th>
				<th
					class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider"
				>
					status
				</th>
				<th
					class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider"
				>
					Last Paiement
				</th>
				<th
					class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider"
				>
					NostR
				</th>
				<th
					class="px-6 py-3 bg-gray-200 text-left text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider"
				>
					Email
				</th>
			</tr>
		</thead>
		<tbody class="bg-white divide-y divide-gray-200">
			{#each data.subscriptions as subscription}
				<tr>
					<td class="px-6 py-4 whitespace-no-wrap"> {subscription._id} </td>
					<td class="px-6 py-4 whitespace-no-wrap"> {subscription._id}</td>
					<td class="px-6 py-4 whitespace-no-wrap"> status </td>
					<td class="px-6 py-4 whitespace-no-wrap"> {subscription.npub}</td>
					<td class="px-6 py-4 whitespace-no-wrap"> {subscription.updatedAt} </td>
					<td class="px-6 py-4 whitespace-no-wrap"> {subscription.email} </td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
