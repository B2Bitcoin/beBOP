<script lang="ts">
	import GoalProgress from './GoalProgress.svelte';
	import PriceTag from './PriceTag.svelte';

	export let challenge: any;
</script>

<div class="bg-gray-75 border-gray-300 border rounded p-4 flex flex-col">
	<div class="flex justify-between items-center">
		<h3 class="font-medium text-[22px] text-gray-850">
			{challenge.name}
		</h3>
		<span class="text-base font-light text-gray-550">Ends April 25</span>
	</div>
	<GoalProgress
		class="font-bold mt-3"
		text="{Number(challenge.score).toLocaleString('en', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0
		})} 🙂"
		percentage={(challenge.score / challenge.goal) * 100}
	/>
	<div class="flex justify-between mt-1 items-center">
		<a href="/" class="text-blue underline">How can I contribute?</a>
		<PriceTag amount={600} class="text-gray-800 text-base" currency="EUR" />
	</div>
</div>
