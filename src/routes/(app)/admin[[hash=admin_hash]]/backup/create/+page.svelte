<script lang="ts">
	import { downloadFile } from '$lib/utils/downloadFile';

	export let data;

	async function exportData() {
		const response = await fetch(`${data.adminPrefix}/backup/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ exportType: 'all' })
		});

		if (!response.ok) {
			alert('Error ' + response.status + ': ' + (await response.text()));
		}

		const blob = await response.blob();
		downloadFile(blob, 'backup.json');
	}
</script>

<h1 class="text-3xl">Export Data</h1>
<button on:click={exportData} class="btn btn-black self-start">Export</button>
