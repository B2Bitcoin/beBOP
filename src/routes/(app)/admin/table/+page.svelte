<script lang="ts">
	import AGGridSvelte from 'ag-grid-svelte';
	import type { GridApi, ColumnApi, GridReadyEvent, ColDef } from 'ag-grid-community';
	import 'ag-grid-community/styles/ag-grid.css';
	import 'ag-grid-community/styles/ag-theme-alpine.css';

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
			headerName: 'Make',
			field: 'make',
			filter: 'agTextColumnFilter',
			sortable: true,
			resizable: true,
			editable: true
		},
		{
			headerName: 'Model',
			field: 'model',
			filter: 'agTextColumnFilter',
			sortable: true,
			resizable: true,
			editable: true
		},
		{
			headerName: 'Price',
			field: 'price',
			filter: 'agNumberColumnFilter',
			sortable: true,
			resizable: true,
			editable: true
		}
	];

	type RowSelectionType = 'multiple' | 'single';

	let gridOptions: {
		columnDefs: ColDef[];
		rowData: { make: string; model: string; price: number }[];
		rowSelection: RowSelectionType;
		pagination: boolean;
		paginationPageSize: number;
		onSelectionChanged: () => void;
	} = {
		columnDefs: columnDefinitions,
		rowData: [
			{ make: 'Toyota', model: 'Celica', price: 35000 },
			{ make: 'Ford', model: 'Mondeo', price: 32000 },
			{ make: 'Porsche', model: 'Boxster', price: 72000 }
		],
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
