<script lang="ts">
	import GoalProgress from '$lib/components/GoalProgress.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { format } from 'date-fns';

	export let data;
</script>

<a href="/admin/challenge/new" class="underline block">Add challenge</a>

<h1 class="text-3xl">List of challenges</h1>
{#each data.challenges as challenge}
	<div class="bg-gray-75 border-gray-300 border rounded p-4 flex flex-col">
		<div class="flex justify-between items-center">
			<h3 class="font-medium text-[22px] text-gray-850">
				{challenge.name}
			</h3>
			<span class="text-base font-light text-gray-550"
				>Ends at
				<time datetime={challenge.endsAt.toJSON()} title={challenge.endsAt.toLocaleString('en')}
					>{format(challenge.endsAt, 'dd-MM-yyyy HH:mm:ss')}</time
				>
			</span>
		</div>
		<GoalProgress
			class="font-bold mt-3"
			text="{Number(challenge.progress).toLocaleString('en', {
				style: 'currency',
				currency: challenge.goal.currency,
				minimumFractionDigits: 0
			})} 🙂"
			percentage={(challenge.progress / challenge.goal.amount) * 100}
		/>
		<div class="flex justify-between mt-1 items-center">
			<a href="/" class="text-blue underline">How can I contribute?</a>
			{#if challenge.goal.currency}
				<PriceTag
					amount={challenge.goal.amount}
					class="text-gray-800 text-base"
					currency={challenge.goal.currency}
				/>
			{:else}
				{challenge.goal.amount} products
			{/if}
		</div>
	</div>
{:else}
	No challenges yet
{/each}
