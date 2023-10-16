<script lang="ts">
	import AGGridSvelte from 'ag-grid-svelte';
	import type { GridApi, ColumnApi, GridReadyEvent, ColDef } from 'ag-grid-community';
	import 'ag-grid-community/styles/ag-grid.css';
	import 'ag-grid-community/styles/ag-theme-alpine.css';

	export let data;

	console.log('data ', data);

	let api: GridApi;
	let columnApi: ColumnApi;
	let selectedRows: any[] = [];

	const onGridReady = (event: GridReadyEvent) => {
		api = event.api;
		columnApi = event.columnApi;
	};

	const onSelectionChanged = () => {
		selectedRows = api.getSelectedRows();
	};

	const columnDefinitions: ColDef[] = [
		{
			headerCheckboxSelection: true,
			checkboxSelection: true,
			width: 50
		},
		{
			headerName: 'Name',
			field: 'name',
			filter: 'agTextColumnFilter',
			sortable: true,
			resizable: true,
			editable: true
		},
		{
			headerName: 'Price',
			field: 'price',
			filter: 'agTextColumnFilter',
			sortable: true,
			resizable: true,
			editable: true
		},
		{
			headerName: 'Currency',
			field: 'currency',
			filter: 'agTextColumnFilter',
			sortable: true,
			resizable: true,
			editable: true
		}
	];

	type RowSelectionType = 'multiple' | 'single';
	type Product = {
		name: string;
		price: number;
		currency: 'BTC' | 'CHF' | 'EUR' | 'USD' | 'SAT';
	};

	let gridOptions: {
		columnDefs: ColDef[];
		rowData: Product[];
		rowSelection: RowSelectionType;
		pagination: boolean;
		paginationPageSize: number;
		onSelectionChanged: () => void;
	} = {
		columnDefs: columnDefinitions,
		rowData: data.products.map((currentProduct) => {
			return {
				name: currentProduct.name,
				price: currentProduct.price.amount,
				currency: currentProduct.price.currency
			};
		}),
		rowSelection: 'multiple',
		pagination: true,
		paginationPageSize: 2,
		onSelectionChanged
	};

	function exportData() {
		api.exportDataAsCsv();
	}
</script>

<div class="ag-theme-alpine" style="width: 600px; height: 300px;">
	<AGGridSvelte {...gridOptions} {onGridReady} />
</div>

<button class="btn btn-black self-start" on:click={exportData}>Export Data</button>

<p>Selected Rows:</p>
<pre>{JSON.stringify(selectedRows, null, 2)}</pre>
