<script lang="ts">
	import { useI18n } from '$lib/i18n.js';

	export let data;

	const { locale } = useI18n();
</script>

<a href="{data.adminPrefix}/challenge/new" class="underline block">Add challenge</a>

<h1 class="text-3xl">List of challenges</h1>
<ul>
	{#each data.challenges as challenge}
		<li>
			<a href="{data.adminPrefix}/challenge/{challenge._id}" class="underline text-blue">
				{challenge.name}
			</a>
			({challenge.progress.toLocaleString($locale)} /
			{challenge.goal.amount.toLocaleString($locale)}
			{challenge.mode === 'moneyAmount' ? challenge.goal.currency : ''}) -
			<span class="text-gray-550">[Challenge={challenge._id}]</span>
		</li>
	{:else}
		No challenges yet
	{/each}
</ul>
