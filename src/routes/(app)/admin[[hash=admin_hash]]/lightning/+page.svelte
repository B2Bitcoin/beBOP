<script lang="ts">
	import { page } from '$app/stores';
	import PriceTag from '$lib/components/PriceTag.svelte';

	export let data;

	let qrCodeDescription = data.qrCodeDescription;
</script>

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
	<li class="break-words">node url: {data.info.uris.join(' / ')}</li>
	{#if data.info.uris.length}
		<li>
			<b>LN url:</b>
			<a href="lightning:ln@{$page.url.hostname}" class="body-hyperlink">ln@{$page.url.hostname}</a>
			- any other @{$page.url.hostname} address will also work
		</li>
	{/if}
</ul>

{#if !data.autopilotActive}
	<form action="?/activateAutopilot" method="POST">
		<button type="submit" class="btn btn-black">Activate autopilot</button>
	</form>
{/if}

<h2 class="text-2xl">Balance</h2>

<ul>
	<li class="flex items-center gap-2">
		<PriceTag amount={data.walletBalance} currency="SAT" convertedTo="SAT" inline />
		{#if data.currencies.priceReference !== 'SAT'}(<PriceTag
				currency="SAT"
				amount={data.walletBalance}
				convertedTo={data.currencies.priceReference}
			/>){/if} in the wallet
	</li>
	<li class="flex items-center gap-2">
		<PriceTag amount={data.channelsBalance} currency="SAT" convertedTo="SAT" inline />
		{#if data.currencies.priceReference !== 'SAT'}(<PriceTag
				currency="SAT"
				amount={data.channelsBalance}
				convertedTo={data.currencies.priceReference}
			/>){/if} in channels
	</li>
</ul>

<h2 class="text-2xl">Invoices</h2>

<p>
	You can set the label that will be added to the QR code for each invoice. This can be useful to
	identify the payment for the user, but it will also increase the size of the QR code.
</p>

<form method="POST" action="?/updateQrCodeDescription">
	<label class="checkbox-label">
		<input
			type="radio"
			name="qrCodeDescription"
			value="none"
			class="form-radio"
			bind:group={qrCodeDescription}
		/> No extra info in QR code
	</label>
	<label class="checkbox-label">
		<input
			type="radio"
			name="qrCodeDescription"
			value="brand"
			class="form-radio"
			bind:group={qrCodeDescription}
		/>
		"{data.brandName}" added to QR code
	</label>
	<label class="checkbox-label">
		<input
			type="radio"
			name="qrCodeDescription"
			value="brandAndOrderNumber"
			class="form-radio"
			bind:group={qrCodeDescription}
		/>
		"{data.brandName} - Order #X" added to QR code
	</label>
	<label class="checkbox-label">
		<input
			type="radio"
			name="qrCodeDescription"
			value="orderUrl"
			class="form-radio"
			bind:group={qrCodeDescription}
		/> Order URL added to QR code
	</label>

	<button type="submit" class="btn btn-black mt-2">Update</button>
</form>
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
