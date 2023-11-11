<script lang="ts">
	import type { Challenge } from '$lib/types/Challenge';
	import GoalProgress from './GoalProgress.svelte';
	import PriceTag from './PriceTag.svelte';
	import { useI18n } from '$lib/i18n';
	import Trans from './Trans.svelte';

	let className = '';
	export { className as class };
	export let challenge: Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt'>;

	const { t, locale } = useI18n();
</script>

<div class="bg-gray-75 border-gray-300 border rounded p-4 flex flex-col {className}">
	<div class="flex justify-between items-center">
		<h3 class="font-medium text-[22px] text-gray-850">
			{challenge.name}
		</h3>
		<span class="text-base font-light text-gray-550"
			><Trans key="challenge.endsAt"
				><time datetime={challenge.endsAt.toJSON()} title={challenge.endsAt.toLocaleString($locale)}
					>{challenge.endsAt.toLocaleDateString($locale)}</time
				></Trans
			>
		</span>
	</div>
	<GoalProgress
		class="font-bold mt-3"
		text="{challenge.goal.currency
			? Number(Math.max(0, challenge.progress)).toLocaleString($locale, {
					style: 'currency',
					currency: challenge.goal.currency,
					minimumFractionDigits: 0
			  })
			: Math.max(challenge.progress, 0)} 🙂"
		goal={challenge.goal.amount}
		progress={challenge.progress}
	/>
	<div class="flex justify-between mt-1 items-right">
		<!-- <a href="/" class="text-link underline">How can I contribute?</a> -->
		<p />
		{#if challenge.progress === challenge.goal.amount}
			<p>{t('challenge.goalMet')}</p>
		{:else if challenge.progress > challenge.goal.amount}
			<p>{t('challenge.goalOvershot')}</p>
		{:else if challenge.goal.currency}
			<PriceTag
				amount={challenge.goal.amount}
				class="text-gray-800 text-base"
				currency={challenge.goal.currency}
				main
			/>
		{:else}
			{t('challenge.numProducts', { count: challenge.goal.amount })}
		{/if}
	</div>
</div>
