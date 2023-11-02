<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Manage confirmation thresholds</h1>
<a href="/admin/config/confirmation-threshold/new" class="underline">Add confirmation threshold</a>

{#each data.confirmationBlocksThresholds as confirmationthreshold}
	<div class="flex gap-6 items-center">
		<a href="/admin/config/confirmation-threshold/{confirmationthreshold._id}" class="flex gap-4">
			<div>Minimum: {`${confirmationthreshold.minAmount} ${confirmationthreshold.currency}`}</div>
			<div>Maximum: {`${confirmationthreshold.maxAmount} ${confirmationthreshold.currency}`}</div>
			<div>Confirmations: {confirmationthreshold.confirmationBlocks}</div>
		</a>
	</div>
{/each}
