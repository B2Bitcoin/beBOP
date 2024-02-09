<script lang="ts">
	import { useI18n } from '$lib/i18n.js';
	import { sum } from '$lib/utils/sum.js';

	export let data;
	let tableOrder: HTMLTableElement;
	let tableProduct: HTMLTableElement;
	let tableOrderSynthesis: HTMLTableElement;
	let monthValue = 1;
	let yearValue = 2023;

	let tableProductSynthesis: HTMLTableElement;
	function downloadCSV(csvData: string, filename: string) {
		const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
		const link = document.createElement('a');
		link.setAttribute('href', csvContent);
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
	}
	function exportcsv(tableElement: HTMLTableElement, filename: string) {
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
		const csvData = `${csvTitle}  ${csvRows}`;
		downloadCSV(csvData, filename);
	}
	const { locale, textAddress } = useI18n();

	function getOrderByMonthYear(month: number, year: number) {
		return data.orders.filter(
			(order) =>
				order.status === 'paid' &&
				order.createdAt.getMonth() === month &&
				order.createdAt.getFullYear() === year
		);
	}
	$: orderByMonthYear = getOrderByMonthYear(monthValue - 1, yearValue);
	$: orderSynthesis = {
		orderQuantity: sum(orderByMonthYear.map((order) => order.quantityOrder)),
		orderTotal: sum(orderByMonthYear.map((order) => order.currencySnapshot.main.totalPrice.amount)),
		currency: 'SAT',
		averageCart: 0
	};
</script>

<h1 class="text-3xl">Reporting{monthValue}</h1>

<div class="gap-4 grid grid-cols-12 mx-auto">
	<div class="col-span-6">
		<h1 class="text-2xl font-bold mb-4">Order detail</h1>
		<button on:click={() => exportcsv(tableOrder, 'order.csv')} class="btn btn-blue mb-2">
			Export CSV
		</button>

		<div class="overflow-x-auto max-h-[500px]">
			<table class="min-w-full table-auto border border-gray-300 bg-white" bind:this={tableOrder}>
				<thead class="bg-gray-200">
					<tr>
						<th class="border border-gray-300 px-4 py-2">Order ID</th>
						<th class="border border-gray-300 px-4 py-2">Order Date</th>
						<th class="border border-gray-300 px-4 py-2">Order Status</th>
						<th class="border border-gray-300 px-4 py-2">Payment mean</th>
						<th class="border border-gray-300 px-4 py-2">Payment Status</th>
						<th class="border border-gray-300 px-4 py-2">Cart</th>
						<th class="border border-gray-300 py-2">Currency</th>
						<th class="border border-gray-300 px-4 py-2">Amount</th>
						<th class="border border-gray-300 px-4 py-2">Expire Date</th>
						<th class="border border-gray-300 px-4 py-2">Billing Info</th>
						<th class="border border-gray-300 px-4 py-2">Shipping Info</th>
					</tr>
				</thead>
				<tbody>
					<!-- Order rows -->
					{#each data.orders as order}
						{#each order.payments as payment}
							<tr class="hover:bg-gray-100 whitespace-nowrap">
								<td class="border border-gray-300 px-4 py-2">{order.number}</td>
								<td class="border border-gray-300 px-4 py-2"
									>{order.createdAt.toLocaleDateString($locale)}</td
								>
								<td class="border border-gray-300 px-4 py-2">{order.status}</td>
								<td class="border border-gray-300 px-4 py-2">{payment.method}</td>
								<td class="border border-gray-300 px-4 py-2">{payment.status}</td>
								<td class="border border-gray-300 px-4 py-2"
									>{order.items.map((item) => item.product.name).join('|')}</td
								>
								<td class="border border-gray-300 px-4 py-2">{payment.price.currency}</td>
								<td class="border border-gray-300 px-4 py-2">{payment.price.amount}</td>
								<td class="border border-gray-300 px-4 py-2">{payment.expiresAt ?? ''}</td>
								<td class="border border-gray-300 px-4 py-2"
									>{order.billingAddress
										? textAddress(order.billingAddress).replace(',', '/')
										: ''}</td
								>
								<td class="border border-gray-300 px-4 py-2"
									>{order.shippingAddress
										? textAddress(order.shippingAddress).replace(',', '/')
										: ''}</td
								>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="col-span-6">
		<h1 class="text-2xl font-bold mb-4">Product detail</h1>
		<button on:click={() => exportcsv(tableProduct, 'productExport.csv')} class="btn btn-blue mb-2">
			Export CSV
		</button>
		<div class="overflow-x-auto max-h-[500px]">
			<table class="min-w-full table-auto border border-gray-300 bg-white" bind:this={tableProduct}>
				<thead class="bg-gray-200">
					<tr>
						<th class="border border-gray-300 px-4 py-2">Product ID</th>
						<th class="border border-gray-300 px-4 py-2">Product Name</th>
						<th class="border border-gray-300 px-4 py-2">Quantity</th>
						<th class="border border-gray-300 px-4 py-2">Order ID</th>
						<th class="border border-gray-300 px-4 py-2">Order Date</th>
						<th class="border border-gray-300 py-2">Currency</th>
						<th class="border border-gray-300 px-4 py-2">Amount</th>
					</tr>
				</thead>
				<tbody>
					<!-- Order rows -->
					{#each data.orders as order}
						{#each order.items as item}
							<tr class="hover:bg-gray-100">
								<td class="border border-gray-300 px-4 py-2">{item.product._id}</td>
								<td class="border border-gray-300 px-4 py-2">{item.product.name}</td>
								<td class="border border-gray-300 px-4 py-2">{item.quantity}</td>
								<td class="border border-gray-300 px-4 py-2">{order.number}</td><td
									class="border border-gray-300 px-4 py-2"
									>{order.createdAt.toLocaleDateString($locale)}</td
								>

								<td class="border border-gray-300 px-4 py-2"
									>{item.currencySnapshot.main.price.currency}</td
								>
								<td class="border border-gray-300 px-4 py-2"
									>{item.currencySnapshot.main.price.amount}</td
								>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="col-span-6">
		<label class="form-label">
			Month
			<input
				class="form-input"
				type="number"
				min="1"
				max="12"
				bind:value={monthValue}
				placeholder="month (example:1)"
			/>
		</label>
	</div>
	<div class="col-span-6">
		<label class="form-label">
			Year
			<input
				class="form-input"
				type="number"
				min="2000"
				max="3000"
				bind:value={yearValue}
				placeholder="year (example 2024)"
			/>
		</label>
	</div>
	<div class="col-span-6">
		<h1 class="text-2xl font-bold mb-4">Order synthesis</h1>
		<button
			on:click={() => exportcsv(tableOrderSynthesis, 'orderSythesisExport.csv')}
			class="btn btn-blue mb-2"
		>
			Export CSV
		</button>
		<div class="overflow-x-auto max-h-[500px]">
			<table
				class="min-w-full table-auto border border-gray-300 bg-white"
				bind:this={tableOrderSynthesis}
			>
				<thead class="bg-gray-200">
					<tr>
						<th class="border border-gray-300 px-4 py-2">Period</th>
						<th class="border border-gray-300 px-4 py-2">Order Quantity</th>
						<th class="border border-gray-300 px-4 py-2">order Total</th>
						<th class="border border-gray-300 px-4 py-2">Average Cart</th>
						<th class="border border-gray-300 py-2">Currency</th>
					</tr>
				</thead>
				<tbody>
					<tr class="hover:bg-gray-100">
						<td class="border border-gray-300 px-4 py-2">{monthValue}/{yearValue}</td>
						<td class="border border-gray-300 px-4 py-2">{orderSynthesis.orderQuantity}</td>
						<td class="border border-gray-300 px-4 py-2">{orderSynthesis.orderTotal}</td>
						<td class="border border-gray-300 px-4 py-2">{orderSynthesis.averageCart}</td>
						<td class="border border-gray-300 px-4 py-2">{orderSynthesis.currency}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
	<div class="col-span-6">
		<h1 class="text-2xl font-bold mb-4">Product synthesis</h1>
		<button
			on:click={() => exportcsv(tableProductSynthesis, 'orderItemsSythesisExport.csv')}
			class="btn btn-blue mb-2"
		>
			Export CSV
		</button>
		<div class="overflow-x-auto max-h-[500px]">
			<table
				class="min-w-full table-auto border border-gray-300 bg-white"
				bind:this={tableProductSynthesis}
			>
				<thead class="bg-gray-200">
					<tr>
						<th class="border border-gray-300 px-4 py-2">Period</th>
						<th class="border border-gray-300 px-4 py-2">Product ID </th>
						<th class="border border-gray-300 px-4 py-2">Product Name</th>
						<th class="border border-gray-300 px-4 py-2">Order Quantity</th>
						<th class="border border-gray-300 px-4 py-2">Currency</th>
						<th class="border border-gray-300 px-4 py-2">Total price</th>
					</tr>
				</thead>
				<tbody>
					<!-- Order rows -->
					{#each orderByMonthYear as order}
						{#each order.items as item}
							<tr class="hover:bg-gray-100">
								<td class="border border-gray-300 px-4 py-2"
									>{order.createdAt.toLocaleDateString($locale)}</td
								>
								<td class="border border-gray-300 px-4 py-2">{item.product._id}</td>
								<td class="border border-gray-300 px-4 py-2">{item.product.name}</td>
								<td class="border border-gray-300 px-4 py-2">{item.quantity}</td>
								<td class="border border-gray-300 px-4 py-2">{item.product.price.currency}</td>
								<td class="border border-gray-300 px-4 py-2">{item.product.price.amount}</td>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
