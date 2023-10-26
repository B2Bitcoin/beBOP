<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Manage confirmation treeshold</h1>
<a href="/admin/config/confirmation-threshold/new" class="underline">Add confirmation treshold</a>

{#each data.confirmationBlocksTresholds as confirmationTreshold}
	<div class="flex gap-6 items-center">
		<a href="/admin/config/confirmation-threshold/{confirmationTreshold._id}" class="flex gap-4">
			<div>Min: {`${confirmationTreshold.minAmount} ${confirmationTreshold.currency}`}</div>
			<div>Max: {`${confirmationTreshold.maxAmount} ${confirmationTreshold.currency}`}</div>
			<div>Confirmations: {confirmationTreshold.confirmationBlocks}</div>
		</a>
	</div>
{/each}
