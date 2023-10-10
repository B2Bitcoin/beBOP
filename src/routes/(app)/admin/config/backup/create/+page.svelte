<script lang="ts">
	async function exportData() {
		const response = await fetch('/admin/config/backup/create', {
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error('Network response was not ok' + response.statusText);
		}

		const blob = await response.blob();
		const link = document.createElement('a');

		link.href = window.URL.createObjectURL(blob);
		link.download = 'backup.json';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<h1 class="text-3xl">Export Data</h1>
<button on:click={exportData} class="btn btn-black self-start">Export Data</button>
