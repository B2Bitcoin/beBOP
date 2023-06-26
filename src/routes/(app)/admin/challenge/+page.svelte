<script lang="ts">
	export let data;
</script>

<a href="/admin/challenge/new" class="underline block">Add challenge</a>

<h1 class="text-3xl">List of challenges</h1>
<ul>
	{#each data.challenges as challenge}
		<li>
			<a href={'/admin/challenge/' + challenge._id} class="underline text-blue">
				{challenge.name}
			</a>
			- <span class="text-gray-550">[Challenge={challenge._id}]</span>
		</li>
	{:else}
		No challenges yet
	{/each}
</ul>
