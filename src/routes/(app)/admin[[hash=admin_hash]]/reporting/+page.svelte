<script lang="ts">
	import { useI18n } from '$lib/i18n.js';

	export let data;
	let tableOrder: HTMLTableElement;
	function downloadCSV(csvData: string, filename: string) {
		const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
		const link = document.createElement('a');
		link.setAttribute('href', csvContent);
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
	}
	function exportcsv(tableElement: HTMLTableElement) {
		const table = tableElement;
		if (!table) {
			return;
		}
		const rows = table.querySelectorAll('tr');
		const data = Array.from(rows).map((row) =>
			Array.from(row.querySelectorAll('td')).map((cell) => cell.innerText.trim())
		);
		const header = table.querySelectorAll('thead');
		const csvTitle = Array.from(header).map((row) =>
			Array.from(row.querySelectorAll('th')).map((cell) => cell.innerText.trim())
		);
		const csvRows = data.map((row) => row.join(',')).join('\n');
		const csvData = `${csvTitle} \n ${csvRows}`;
		downloadCSV(csvData, 'orderExport.csv');
	}
	const { locale } = useI18n();
</script>

<h1 class="text-3xl">Reporting</h1>

<div class="max-w-7xl">
	<button on:click={() => exportcsv(tableOrder)} class="btn btn-blue"> Export CSV </button>
	<h1 class="text-2xl font-bold mb-4">Order Table</h1>
	<div class="overflow-x-auto max-h-[500px]">
		<table class="min-w-full table-auto border border-gray-300 bg-white" bind:this={tableOrder}>
			<thead class="bg-gray-200">
				<tr>
					<th class="border border-gray-300 px-4 py-2">Order Number</th>
					<th class="border border-gray-300 px-4 py-2">Order Date</th>
					<th class="border border-gray-300 px-4 py-2">Currency</th>
					<th class="border border-gray-300 px-4 py-2">Amount</th>
					<th class="border border-gray-300 px-4 py-2">Payment Status</th>
				</tr>
			</thead>
			<tbody>
				<!-- Order rows -->
				{#each data.orders as order}
					<tr class="hover:bg-gray-100">
						<td class="border border-gray-300 px-4 py-2">{order.number}</td>
						<td class="border border-gray-300 px-4 py-2"
							>{order.createdAt.toLocaleDateString($locale)}</td
						>
						<td class="border border-gray-300 px-4 py-2"
							>{order.currencySnapshot.main.totalPrice.currency}</td
						>
						<td class="border border-gray-300 px-4 py-2"
							>{order.currencySnapshot.main.totalPrice.amount}</td
						>
						<td class="border border-gray-300 px-4 py-2">{order.status}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
