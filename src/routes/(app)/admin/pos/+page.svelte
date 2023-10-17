<script lang="ts">
	export let data;

	console.log('data.seats', data.seats);
</script>

<h1 class="text-3xl">Point of sale</h1>

<a href="/admin/pos/create" class="underline">Create Seat</a>

<div class="flex flex-col flex-wrap gap-2">
	{#each data.seats as seat}
		<a href="/admin/pos/{seat._id}">{seat.login}</a>
	{/each}
</div>
