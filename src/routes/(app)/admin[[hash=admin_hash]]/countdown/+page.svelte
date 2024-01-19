<script lang="ts">
	export let data;
</script>

<a href="{data.adminPrefix}/countdown/new" class="underline block">Add countdown</a>

<h1 class="text-3xl">List of Countdown</h1>

<ul>
	{#each data.countdowns as countdown}
		<li>
			{countdown._id} -
			<a href="{data.adminPrefix}/countdown/{countdown._id}" class="underline body-hyperlink"
				>{countdown.title}</a
			>
		</li>
	{:else}
		No countdown yet
	{/each}
</ul>
