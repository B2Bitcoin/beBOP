<script lang="ts">
	import PriceTag from '$lib/components/PriceTag.svelte';

	export let data;
</script>

<main class="p-4 flex flex-col gap-4">
	<h1 class="text-3xl">Lightning node</h1>

	<h2 class="text-2xl">Balance</h2>

	<ul>
		<li class="flex items-center gap-2">
			<PriceTag amount={data.walletBalance} currency="SAT" short class="inline-flex" /> in the wallet
		</li>
		<li class="flex items-center gap-2">
			<PriceTag amount={data.channelsBalance} currency="SAT" short class="inline-flex" /> in the channels
		</li>
	</ul>

	<h2 class="text-2xl">Channels</h2>

	<ul>
		{#each data.channels as channel}
			<li>JSON.stringify(channel)</li>
		{:else}
			No channels open
		{/each}
	</ul>
</main>
