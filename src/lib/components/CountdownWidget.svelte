<script lang="ts">
	import type { Countdown } from '$lib/types/Countdown';

	let className = '';
	export { className as class };
	export let countdown: Pick<
		Countdown,
		'_id' | 'shortDescription' | 'description' | 'beginsAt' | 'endsAt'
	>;
	$: distance = countdown.endsAt.getTime() - new Date().getTime();
	function UpdateCountdown() {
		if (countdown.beginsAt > new Date()) {
			distance = Math.max(countdown.endsAt.getTime() - countdown.beginsAt.getTime(), 0);
		} else {
			distance = Math.max(countdown.endsAt.getTime() - new Date().getTime(), 0);
		}
	}
	setInterval(UpdateCountdown, 1000);
</script>

<div class="flex flex-row gap-4 {className}">
	<div class="flex flex-row w-full tagWidget tagWidget-main mb-4 grow pr-5">
		<div class="p-4 grow">
			<h2 class="text-2xl font-bold mb-2 body-title">{countdown.shortDescription}</h2>

			<p class="mb-4">{countdown.description}</p>
		</div>

		<div class="grow-[2] flex flex-row gap-6 p-4">
			{#each ['DAYS', 'HOURS', 'MINS', 'SECS'] as unit (unit)}
				<span>
					<h1 class="text-3xl font-bold body-title">
						{Math.floor(
							unit === 'DAYS'
								? distance / (1000 * 60 * 60 * 24)
								: unit === 'HOURS'
								? (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
								: unit === 'MINS'
								? (distance % (1000 * 60 * 60)) / (1000 * 60)
								: (distance % (1000 * 60)) / 1000
						)}
					</h1>
					{unit}
				</span>
			{/each}
		</div>
	</div>
</div>
