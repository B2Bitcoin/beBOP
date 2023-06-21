<script lang="ts">
	import type { Challenge } from '$lib/types/Challenge';
	import { format } from 'date-fns';
	import GoalProgress from './GoalProgress.svelte';
	import PriceTag from './PriceTag.svelte';

	export let challenge: Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt'>;
</script>

<div class="bg-gray-75 border-gray-300 border rounded p-4 flex flex-col">
	<div class="flex justify-between items-center">
		<h3 class="font-medium text-[22px] text-gray-850">
			{challenge.name}
		</h3>
		<span class="text-base font-light text-gray-550"
			>Ends <time datetime={challenge.endsAt.toJSON()} title={challenge.endsAt.toLocaleString('en')}
				>{format(challenge.endsAt, 'MMMM dd')}</time
			></span
		>
	</div>
	<GoalProgress
		class="font-bold mt-3"
		text="{challenge.goal.currency
			? Number(challenge.progress).toLocaleString('en', {
					style: 'currency',
					currency: challenge.goal.currency,
					minimumFractionDigits: 0
			  })
			: challenge.progress} 🙂"
		percentage={(challenge.progress / challenge.goal.amount) * 100}
	/>
	<div class="flex justify-between mt-1 items-center">
		<a href="/" class="text-link underline">How can I contribute?</a>
		{#if challenge.progress == challenge.goal.amount}
			<p>Good job guys! 👏👏</p>
		{:else if challenge.progress > challenge.goal.amount}
			<p>You are amazing guys! 🤭</p>
		{:else if challenge.goal.currency}
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
