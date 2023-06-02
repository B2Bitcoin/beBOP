<script lang="ts">
	import { formatDistance } from 'date-fns';

	export let data;
</script>

<h1 class="text-3xl">Config</h1>

<p>Configured URL: {data.origin}</p>

<form method="post" class="flex flex-col gap-6">
	<label class="flex gap-2 cursor-pointer items-center">
		<input
			type="checkbox"
			name="checkoutButtonOnProductPage"
			class="form-checkbox rounded-sm cursor-pointer"
			checked={data.checkoutButtonOnProductPage}
		/>
		checkoutButtonOnProductPage
	</label>
	<label class="flex gap-2 cursor-pointer items-center">
		<input
			type="checkbox"
			name="discovery"
			class="form-checkbox rounded-sm cursor-pointer"
			checked={data.discovery}
		/>
		discovery
	</label>
	<label class="form-label">
		Subscription duration
		<select
			name="subscriptionDuration"
			class="form-input max-w-[25rem]"
			value={data.subscriptionDuration}
		>
			{#each ['month', 'day', 'hour'] as duration}
				<option value={duration}>{duration}</option>
			{/each}
		</select>
	</label>
	<label class="form-label">
		Subscription reminder
		<select
			name="subscriptionReminderSeconds"
			value={data.subscriptionReminderSeconds}
			class="form-input max-w-[25rem]"
		>
			{#each [86400 * 7, 86400 * 3, 86400, 3600, 5 * 60] as seconds}
				<option value={seconds}
					>{formatDistance(0, seconds * 1000)} before the end of the subscription</option
				>
			{/each}
		</select>
	</label>

	<label class="form-label">
		Confirmation blocks
		<input
			type="number"
			min="0"
			step="1"
			name="confirmationBlocks"
			value={data.confirmationBlocks}
		/>
	</label>
	<input type="submit" value="Update" class="btn btn-gray self-start" />
</form>
