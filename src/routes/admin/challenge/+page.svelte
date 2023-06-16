<script lang="ts">
<<<<<<< HEAD
=======
	import ChallengeWidget from '$lib/components/ChallengeWidget.svelte';

>>>>>>> a9495e820aa07594eb844a0c0cdedfc4d2cc9a2d
	export let data;
</script>

<a href="/admin/challenge/new" class="underline block">Add challenge</a>

<h1 class="text-3xl">List of challenges</h1>
<<<<<<< HEAD
<ul>
	{#each data.challenges as challenge}
		<li>
			<a href={'/admin/challenge/' + challenge._id} class="underline text-blue">
				{challenge.name}
			</a>
		</li>
	{:else}
		No challenges yet
	{/each}
</ul>
=======
{#each data.challenges as challenge}
	<ChallengeWidget {challenge} />
{:else}
	No challenges yet
{/each}
>>>>>>> a9495e820aa07594eb844a0c0cdedfc4d2cc9a2d
