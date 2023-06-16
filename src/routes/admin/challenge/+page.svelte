<script lang="ts">
	import ChallengeWidget from '$lib/components/ChallengeWidget.svelte';

	export let data;
</script>

<a href="/admin/challenge/new" class="underline block">Add challenge</a>

<h1 class="text-3xl">List of challenges</h1>
{#each data.challenges as challenge}
	<ChallengeWidget {challenge} />
{:else}
	No challenges yet
{/each}
