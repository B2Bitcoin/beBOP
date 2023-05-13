<script lang="ts">
	import PriceTag from '$lib/components/PriceTag.svelte';

	export let data;
</script>

<main class="p-4 flex flex-col gap-4">
	<h1 class="text-3xl">Lightning node</h1>

	<h2 class="text-2xl">Status</h2>

	<ul>
		<li>testnet: {data.info.testnet}</li>
		<li>alias: {data.info.alias}</li>
		<li>autopilot active: {data.autopilotActive}</li>
		<li>pending channels: {data.info.num_pending_channels}</li>
		<li>active channels: {data.info.num_active_channels}</li>
		<li>inactive channels: {data.info.num_inactive_channels}</li>
		<li>synced to chain: {data.info.synced_to_chain}</li>
		<li>synced to graph: {data.info.synced_to_graph}</li>
		<li>peers: {data.info.num_peers}</li>
		<li>node url: {data.info.uris.join(' / ')}</li>
	</ul>

	{#if !data.autopilotActive}
		<form action="?/activateAutopilot" method="POST">
			<button type="submit" class="btn btn-black">Activate autopilot</button>
		</form>
	{/if}

	<h2 class="text-2xl">Balance</h2>

	<ul>
		<li class="flex items-center gap-2">
			<PriceTag amount={data.walletBalance} currency="SAT" short class="inline-flex" /> in the wallet
		</li>
		<li class="flex items-center gap-2">
			<PriceTag amount={data.channelsBalance} currency="SAT" short class="inline-flex" /> in channels
		</li>
	</ul>

	<h2 class="text-2xl">Channels</h2>

	<ul>
		{#each data.channels as channel}
			<li>
				Channel {channel.chan_id}: {channel.capacity.toLocaleString('en')} capacity / {channel.local_balance.toLocaleString(
					'en'
				)} local balance /
				{channel.remote_balance.toLocaleString('en')} remote balance
			</li>
		{:else}
			No channels open
		{/each}
	</ul>
</main>
