<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Point of sale</h1>

<a href="/admin/pos/create" class="underline">Create POS user</a>

<h2 class="text-2xl">POS users</h2>

<ul class="flex flex-col flex-wrap gap-2 list-disc ml-4">
	{#each data.posUsers as user}
		<li><a href="/admin/pos/{user._id}" class="underline">{user.login}</a></li>
	{/each}
</ul>
