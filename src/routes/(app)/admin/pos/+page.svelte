<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Point of sale</h1>

<a href="/admin/pos/create" class="underline">Create Seat</a>

<div class="flex flex-col flex-wrap gap-2">
	{#each data.posUsers as user}
		<a href="/admin/pos/{user._id}">{user.login}</a>
	{/each}
</div>
