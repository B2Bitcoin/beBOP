<script lang="ts">
	import { page } from '$app/stores';
	import { useI18n } from '$lib/i18n.js';
	import type { PaidSubscription } from '$lib/types/PaidSubscription.js';

	export let data;
	function subscriptionStatus(subscription: PaidSubscription) {
		if (subscription.updatedAt.getTime() + subscription.paidUntil.getTime() >= Date.now()) {
			// if( subscription.updatedAt.getTime() + subscription.paidUntil.getTime() - subscription.notifications. )
			return 'active';
		} else {
			subscription.updatedAt.getTime() + subscription.paidUntil.getTime() < Date.now();
		}
		return 'expired';
	}

	function exportcsv() {
		const table = document.getElementById('subscription-table');
		if (!table) {
			return;
		}

		const rows = table.querySelectorAll('tr');
		const data = Array.from(rows).map((row) =>
			Array.from(row.querySelectorAll('td')).map((cell) => cell.innerText.trim())
		);

		const csvRows = data.map((row) => row.join(',')).join('\n');
		const csvData = 'ID,Status,Last Payment,NostR,Email\n' + csvRows;

		downloadCSV(csvData, 'subscriptions.csv');
	}

	function downloadCSV(csvData: string, filename: string) {
		const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
		const link = document.createElement('a');
		link.setAttribute('href', csvContent);
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
	}

	const { locale } = useI18n();
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
			>Edit a product</a
		>
	</li>
	<li class="mr-2">
		<a
			href="{data.adminPrefix}/product/{data.product._id}/subscribers"
			class="{$page.url.pathname === `${data.adminPrefix}/product/${data.product._id}/subscribers`
				? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
				: 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} "
			>Subscribers</a
		>
	</li>
</ul>
<button
	on:click={exportcsv}
	id="export-button"
	class="bg-blue-500 mx-auto hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
>
	Export CSV
</button>
<div class="container mx-auto p-4">
	<table class="min-w-full divide-y divide-gray-200" id="subscription-table">
		<thead>
			<tr>
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
			{#if data.subscriptions.length > 0}
				{#each data.subscriptions as subscription}
					<tr>
						<td class="px-6 py-4 whitespace-no-wrap"> {subscription._id}</td>
						<td class="px-6 py-4 whitespace-no-wrap">
							{subscriptionStatus(subscription)}
						</td>
						<td class="px-6 py-4 whitespace-no-wrap">
							{subscription.updatedAt.toLocaleDateString($locale)}</td
						>
						<td class="px-6 py-4 whitespace-no-wrap">
							{subscription.user.npub ? subscription.user.npub : ''}</td
						>
						<td class="px-6 py-4 whitespace-no-wrap">
							{subscription.user.email ? subscription.user.email : ''}</td
						>
					</tr>
				{/each}
			{:else}
				<p>empty data !</p>
			{/if}
		</tbody>
	</table>
</div>
