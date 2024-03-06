<script lang="ts">
	import { useI18n } from '$lib/i18n.js';
	import { sum } from '$lib/utils/sum.js';
	import { toCurrency } from '$lib/utils/toCurrency';

	export let data;
	let tableOrder: HTMLTableElement;
	let tableProduct: HTMLTableElement;
	let tablePayment: HTMLTableElement;
	let tableOrderSynthesis: HTMLTableElement;
	let tablePaymentSynthesis: HTMLTableElement;
	let monthValue = 1;
	let yearValue = 2023;
	let tableProductSynthesis: HTMLTableElement;
	let includePending = false;
	let includeExpired = false;
	let includeCanceled = false;
	let includePartiallyPaid = false;

	const { locale, textAddress, countryName } = useI18n();

	$: orderFiltered = data.orders.filter(
		(order) =>
			order.status === 'paid' ||
			(includePending && order.status === 'pending') ||
			(includeExpired && order.status === 'expired') ||
			(includeCanceled && order.status === 'canceled') ||
			(includePartiallyPaid && order.payments.find((payment) => payment.status === 'paid'))
	);
	$: orderByMonthYear = getOrderByMonthYear(monthValue - 1, yearValue);
	$: quantityOfPaymentMeanMonthYear = quantityOfPaymentMean(monthValue, yearValue);
	$: quantityOfProductMonthYear = quantityOfProduct(monthValue, yearValue);
	$: orderSynthesis = {
		orderQuantity: sum(orderByMonthYear.map((order) => order.quantityOrder)),
		orderNumber: orderByMonthYear.length,
		orderTotal: sum(
			orderByMonthYear.map((order) =>
				toCurrency(
					data.currencies.main,
					order.currencySnapshot.main.totalPrice.amount,
					order.currencySnapshot.main.totalPrice.currency
				)
			)
		),
		averageCart: 0
	};

	function downloadJSON(orderId: string) {
		const order = orderFiltered.find((order) => order._id === orderId);
		if (order) {
			const jsonData = JSON.stringify(order);
			const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData);
			const link = document.createElement('a');
			link.setAttribute('href', jsonContent);
			link.setAttribute('download', `order${orderId}.json`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			console.error(`Order with ID ${orderId} not found.`);
		}
	}

	function downloadCSV(csvData: string, filename: string) {
		const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
		const link = document.createElement('a');
		link.setAttribute('href', csvContent);
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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

	function getOrderByMonthYear(month: number, year: number) {
		return data.orders.filter(
			(order) =>
				order.status === 'paid' &&
				order.createdAt.getMonth() === month &&
				order.createdAt.getFullYear() === year
		);
	}

	function quantityOfProduct(month: number, year: number) {
		const productQuantities: Record<string, number> = {};
		getOrderByMonthYear(month - 1, year).forEach((order) => {
			order.items.forEach((item) => {
				if (productQuantities[item.product._id]) {
					productQuantities[item.product._id] += item.quantity;
				} else {
					productQuantities[item.product._id] = item.quantity;
				}
			});
		});
		return productQuantities;
	}
	function quantityOfPaymentMean(month: number, year: number) {
		const paymentMeanQuantities: Record<string, { quantity: number; total: number }> = {};
		getOrderByMonthYear(month - 1, year).forEach((order) => {
			order.payments.forEach((payment) => {
				if (paymentMeanQuantities[payment.method]) {
					paymentMeanQuantities[payment.method].quantity += 1;
					paymentMeanQuantities[payment.method].total += toCurrency(
						data.currencies.main,
						payment.currencySnapshot.main.price.amount,
						payment.currencySnapshot.main.price.currency
					);
				} else {
					paymentMeanQuantities[payment.method] = {
						quantity: 1,
						total: toCurrency(
							data.currencies.main,
							payment.currencySnapshot.main.price.amount,
							payment.currencySnapshot.main.price.currency
						)
					};
				}
			});
		});
		return paymentMeanQuantities;
	}
	function fetchProductById(productId: string) {
		for (const order of orderByMonthYear) {
			for (const item of order.items) {
				if (item.product._id === productId) {
					return item.product;
				}
			}
		}
		return null;
	}
</script>

<h1 class="text-3xl">Reporting</h1>
<div class="gap-4 grid grid-cols-3">
	<label class="col-span-3 checkbox-label">
		<input class="form-checkbox" type="checkbox" bind:checked={includePending} /> include pending orders
	</label>
	<label class="col-span-3 checkbox-label">
		<input class="form-checkbox" type="checkbox" bind:checked={includeExpired} /> include expired orders
	</label>
	<label class="col-span-3 checkbox-label">
		<input class="form-checkbox" type="checkbox" bind:checked={includeCanceled} /> include canceled orders
	</label>
	<label class="col-span-3 checkbox-label">
		<input class="form-checkbox" type="checkbox" bind:checked={includePartiallyPaid} /> include partially
		paid orders
	</label>
</div>
<div class="gap-4 grid grid-cols-12 mx-auto">
	<div class="col-span-12">
		<h1 class="text-2xl font-bold mb-4">Order detail</h1>
		<button on:click={() => exportcsv(tableOrder, 'order-detail.csv')} class="btn btn-blue mb-2">
			Export CSV
		</button>

		<div class="overflow-x-auto max-h-[500px]">
			<table class="min-w-full table-auto border border-gray-300 bg-white" bind:this={tableOrder}>
				<thead class="bg-gray-200">
					<tr class="whitespace-nowrap">
						<th class="border border-gray-300 px-4 py-2">Order ID</th>
						<th class="border border-gray-300 px-4 py-2">Order URL</th>
						<th class="border border-gray-300 px-4 py-2">Order Date</th>
						<th class="border border-gray-300 px-4 py-2">Order Status</th>
						<th class="border border-gray-300 py-2">Currency</th>
						<th class="border border-gray-300 px-4 py-2">Amount</th>
						<th class="border border-gray-300 px-4 py-2">Billing Country</th>
						<th class="border border-gray-300 px-4 py-2">Billing Info</th>
						<th class="border border-gray-300 px-4 py-2">Shipping Country</th>
						<th class="border border-gray-300 px-4 py-2">Shipping Info</th>
						<th class="border border-gray-300 px-4 py-2">Cart</th>
					</tr>
				</thead>
				<tbody>
					<!-- Order rows -->
					{#each orderFiltered as order}
						<tr class="hover:bg-gray-100 whitespace-nowrap">
							<td class="border border-gray-300 px-4 py-2"
								><a
									href="#exportJson"
									class="underline text-blue-500"
									on:click={() => downloadJSON(order._id)}>{order.number}</a
								></td
							>
							<td class="border border-gray-300 px-4 py-2"
								>{data.websiteLink + '/order/' + order._id}</td
							>
							<td class="border border-gray-300 px-4 py-2"
								>{order.createdAt.toLocaleDateString($locale)}</td
							>
							<td class="border border-gray-300 px-4 py-2">{order.status}</td>

							<td class="border border-gray-300 px-4 py-2">{data.currencies.main}</td>
							<td class="border border-gray-300 px-4 py-2"
								>{toCurrency(
									data.currencies.main,
									order.currencySnapshot.main.totalPrice.amount,
									order.currencySnapshot.main.totalPrice.currency
								)}</td
							>
							<td class="border border-gray-300 px-4 py-2"
								>{countryName(order.billingAddress?.country ?? order.ipCountry ?? '')}</td
							>
							<td class="border border-gray-300 px-4 py-2"
								>{order.billingAddress
									? textAddress(order.billingAddress).replace(',', '/')
									: ''}</td
							>
							<td class="border border-gray-300 px-4 py-2"
								>{countryName(order.shippingAddress?.country ?? order.ipCountry ?? '')}</td
							>
							<td class="border border-gray-300 px-4 py-2"
								>{order.shippingAddress
									? textAddress(order.shippingAddress).replace(',', '/')
									: ''}</td
							>
							<td class="border border-gray-300 px-4 py-2"
								>{order.items.map((item) => item.product.name).join('|')}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="col-span-12">
		<h1 class="text-2xl font-bold mb-4">Product detail</h1>
		<button
			on:click={() => exportcsv(tableProduct, 'product-detail.csv')}
			class="btn btn-blue mb-2"
		>
			Export CSV
		</button>
		<div class="overflow-x-auto max-h-[500px]">
			<table class="min-w-full table-auto border border-gray-300 bg-white" bind:this={tableProduct}>
				<thead class="bg-gray-200">
					<tr>
						<th class="border border-gray-300 px-4 py-2">Product URL</th>
						<th class="border border-gray-300 px-4 py-2">Product Name</th>
						<th class="border border-gray-300 px-4 py-2">Quantity</th>
						<th class="border border-gray-300 px-4 py-2">Deposit</th>
						<th class="border border-gray-300 px-4 py-2">Order ID</th>
						<th class="border border-gray-300 px-4 py-2">Order Date</th>
						<th class="border border-gray-300 py-2">Currency</th>
						<th class="border border-gray-300 px-4 py-2">Amount</th>
					</tr>
				</thead>
				<tbody>
					<!-- Order rows -->
					{#each orderFiltered as order}
						{#each order.items as item}
							<tr class="hover:bg-gray-100 whitespace-nowrap">
								<td class="border border-gray-300 px-4 py-2"
									>{data.websiteLink + '/product/' + item.product._id}</td
								>
								<td class="border border-gray-300 px-4 py-2">{item.product.name}</td>
								<td class="border border-gray-300 px-4 py-2">{item.quantity}</td>
								<td class="border border-gray-300 px-4 py-2">{item.depositPercentage ?? 100}</td>
								<td class="border border-gray-300 px-4 py-2">{order.number}</td><td
									class="border border-gray-300 px-4 py-2"
									>{order.createdAt.toLocaleDateString($locale)}</td
								>
								<td class="border border-gray-300 px-4 py-2">{data.currencies.main}</td>
								<td class="border border-gray-300 px-4 py-2"
									>{(toCurrency(
										data.currencies.main,
										item.product.price.amount,
										item.product.price.currency
									) *
										(item.product.deposit?.percentage ?? 100) *
										item.quantity) /
										100}</td
								>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="col-span-12">
		<h1 class="text-2xl font-bold mb-4">Payment Detail</h1>
		<button
			on:click={() => exportcsv(tablePayment, 'payment-detail.csv')}
			class="btn btn-blue mb-2"
		>
			Export CSV
		</button>

		<div class="overflow-x-auto max-h-[500px]">
			<table class="min-w-full table-auto border border-gray-300 bg-white" bind:this={tablePayment}>
				<thead class="bg-gray-200">
					<tr class="whitespace-nowrap">
						<th class="border border-gray-300 px-4 py-2">Order ID</th>
						<th class="border border-gray-300 px-4 py-2">Payment Date</th>
						<th class="border border-gray-300 px-4 py-2">Order Status</th>
						<th class="border border-gray-300 px-4 py-2">Payment mean</th>
						<th class="border border-gray-300 px-4 py-2">Payment Status</th>
						<th class="border border-gray-300 px-4 py-2">Payment Info</th>
						<th class="border border-gray-300 py-2">Currency</th>
						<th class="border border-gray-300 px-4 py-2">Amount</th>
						<th class="border border-gray-300 py-2">Cashed Currency</th>
						<th class="border border-gray-300 px-4 py-2">Cashed Amount</th>
						<th class="border border-gray-300 px-4 py-2">Billing Country</th>
					</tr>
				</thead>
				<tbody>
					<!-- Order rows -->
					{#each data.orders.filter((order) => order.status === 'paid') as order}
						{#each order.payments as payment}
							<tr class="hover:bg-gray-100 whitespace-nowrap">
								<td class="border border-gray-300 px-4 py-2">{order.number}</td>
								<td class="border border-gray-300 px-4 py-2"
									>{payment.paidAt?.toLocaleDateString($locale)}</td
								>
								<td class="border border-gray-300 px-4 py-2">{order.status}</td>
								<td class="border border-gray-300 px-4 py-2">{payment.method}</td>
								<td class="border border-gray-300 px-4 py-2">{payment.status}</td>
								<td class="border border-gray-300 px-4 py-2"
									>{payment.method === 'lightning'
										? payment.invoiceId
										: payment.method === 'bank-transfer'
										? payment.bankTransferNumber
										: payment.method === 'card'
										? payment.transactions?.[0].transaction_code
										: payment.method === 'bitcoin'
										? payment.transactions?.[0].txid
										: payment.detail || ''}</td
								>

								<td class="border border-gray-300 px-4 py-2">{data.currencies.main}</td>
								<td class="border border-gray-300 px-4 py-2"
									>{toCurrency(
										data.currencies.main,
										payment.currencySnapshot.main.price.amount,
										payment.currencySnapshot.main.price.currency
									)}</td
								>
								<td class="border border-gray-300 px-4 py-2">{payment.price.currency}</td>
								<td class="border border-gray-300 px-4 py-2">{payment.price.amount}</td>
								<td class="border border-gray-300 px-4 py-2"
									>{countryName(
										order.billingAddress?.country ??
											order.shippingAddress?.country ??
											order.ipCountry ??
											''
									)}</td
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
	<div class="col-span-12">
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
					<tr class="whitespace-nowrap">
						<th class="border border-gray-300 px-4 py-2">Period</th>
						<th class="border border-gray-300 px-4 py-2">Order Quantity</th>
						<th class="border border-gray-300 px-4 py-2">order Total</th>
						<th class="border border-gray-300 px-4 py-2">Average Cart</th>
						<th class="border border-gray-300 py-2">Currency</th>
					</tr>
				</thead>
				<tbody>
					<tr class="hover:bg-gray-100 whitespace-nowrap">
						<td class="border border-gray-300 px-4 py-2">{monthValue}/{yearValue}</td>
						<td class="border border-gray-300 px-4 py-2">{orderSynthesis.orderNumber}</td>
						<td class="border border-gray-300 px-4 py-2">{orderSynthesis.orderTotal}</td>
						<td class="border border-gray-300 px-4 py-2"
							>{orderSynthesis.orderNumber
								? orderSynthesis.orderTotal / orderSynthesis.orderNumber
								: 0}</td
						>
						<td class="border border-gray-300 px-4 py-2">{data.currencies.main}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
	<div class="col-span-12">
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
					<tr class="whitespace-nowrap">
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
					{#each Object.entries(quantityOfProductMonthYear) as [productId, quantity]}
						<tr class="hover:bg-gray-100 whitespace-nowrap">
							<td class="border border-gray-300 px-4 py-2">{monthValue}/{yearValue}</td>
							<td class="border border-gray-300 px-4 py-2">{productId}</td>
							<td class="border border-gray-300 px-4 py-2">{fetchProductById(productId)?.name}</td>
							<td class="border border-gray-300 px-4 py-2">{quantity}</td>
							<td class="border border-gray-300 px-4 py-2">{data.currencies.main}</td>
							<td class="border border-gray-300 px-4 py-2"
								>{toCurrency(
									data.currencies.main,
									(fetchProductById(productId)?.price.amount || 0) * quantity,
									fetchProductById(productId)?.price.currency || 'BTC'
								)}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="col-span-12">
		<h1 class="text-2xl font-bold mb-4">Payment synthesis</h1>
		<button
			on:click={() => exportcsv(tablePaymentSynthesis, 'orderPaymentSythesis.csv')}
			class="btn btn-blue mb-2"
		>
			Export CSV
		</button>
		<div class="overflow-x-auto max-h-[500px]">
			<table
				class="min-w-full table-auto border border-gray-300 bg-white"
				bind:this={tablePaymentSynthesis}
			>
				<thead class="bg-gray-200">
					<tr class="whitespace-nowrap">
						<th class="border border-gray-300 px-4 py-2">Period</th>
						<th class="border border-gray-300 px-4 py-2">Payment Mean </th>
						<th class="border border-gray-300 px-4 py-2">Payment Quantity</th>
						<th class="border border-gray-300 px-4 py-2">Total price</th>
						<th class="border border-gray-300 px-4 py-2">Currency</th>
					</tr>
				</thead>
				<tbody>
					<!-- Order rows -->
					{#each Object.entries(quantityOfPaymentMeanMonthYear) as [method, { quantity, total }]}
						<tr class="hover:bg-gray-100 whitespace-nowrap">
							<td class="border border-gray-300 px-4 py-2">{monthValue}/{yearValue}</td>
							<td class="border border-gray-300 px-4 py-2">{method}</td>
							<td class="border border-gray-300 px-4 py-2">{quantity}</td>
							<td class="border border-gray-300 px-4 py-2">{total}</td>
							<td class="border border-gray-300 px-4 py-2">{data.currencies.main}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
