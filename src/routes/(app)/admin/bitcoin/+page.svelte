<script lang="ts">
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { downloadFile } from '$lib/utils/downloadFile.js';
	import { formatDistance } from 'date-fns';
	import { tick } from 'svelte';

	export let data;

	let orderById = Object.fromEntries([...data.orders].map((order) => [order._id, order]));

	let walletToCreate = 'bootik';

	async function inputWalletName(event: Event) {
		const walletName = prompt('Wallet name')?.trim();

		if (!walletName) {
			return;
		}

		walletToCreate = walletName;

		await tick();

		(event.currentTarget as HTMLFormElement).submit();
	}

	async function dump(wallet: string) {
		const response = await fetch(`/admin/bitcoin/dump`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ wallet })
		});

		if (response.ok) {
			downloadFile(await response.blob(), `wallet-${wallet}.json`);
		} else {
			alert('Error dumping wallet: ' + (await response.text()));
		}
	}
</script>

<h1 class="text-3xl">Bitcoin node</h1>

<h2 class="text-2xl">Chain</h2>

<ul>
	<li>Blocks: {data.blockchainInfo.blocks.toLocaleString('en')}</li>
	<li>Chain: {data.blockchainInfo.chain}</li>
</ul>

<h2 class="text-2xl">Wallet</h2>

{#if data.wallets.length}
	<ul>
		{#each data.wallets as wallet}
			<li class="flex gap-2">
				<span class:font-bold={wallet === data.currentWallet}>{wallet}</span>
				{#if data.currentWallet !== wallet}
					<form action="?/setCurrentWallet" method="post">
						<input type="hidden" value={wallet} name="wallet" />
						<button type="submit" class="text-link underline"> select </button>
					</form>
				{/if}
				<button on:click|preventDefault={() => dump(wallet)} class="text-link underline">
					dump
				</button>
			</li>
		{/each}
	</ul>

	<p>
		Changing wallet in an active bootik means that incoming transactions in the old wallet will not
		be detected
	</p>
{/if}

<div class="flex gap-2">
	<form action="?/createWallet" method="post" on:submit|preventDefault={inputWalletName}>
		<input type="hidden" name="wallet" value={walletToCreate} />
		<button class="btn btn-black">Create wallet</button>
	</form>
	<button class="btn text-white bg-green-500">Cash-out</button>
	<button class="btn btn-blue">Cash-in</button>
</div>

<h2 class="text-2xl">Balance</h2>

<PriceTag amount={data.balance} currency="BTC" />

<h2 class="text-2xl">Transactions</h2>

<ul>
	{#each data.transactions as transaction}
		<li class="flex flex-wrap gap-2">
			Amount: {transaction.amount}
			{#if data.currencies.priceReference !== 'BTC'}(<PriceTag
					currency="BTC"
					amount={transaction.amount}
					convertedTo={data.currencies.priceReference}
				/>){/if} / Txid:
			<a
				class="underline text-link break-all"
				href="https://www.blockchain.com/en/explorer/transactions/{data.blockchainInfo.chain ===
				'test'
					? 'btc-testnet'
					: 'btc'}/{transaction.txid}">{transaction.txid}</a
			>
			{#if transaction.label.startsWith('order:') && orderById[transaction.label.slice('order:'.length)]}
				{@const orderCreatedAt = orderById[transaction.label.slice('order:'.length)].createdAt}
				/
				<a class="underline text-link" href="/order/{transaction.label.slice('order:'.length)}"
					>Order</a
				>
				created
				<time datetime={orderCreatedAt.toJSON()} title={orderCreatedAt.toLocaleString('en')}
					>{formatDistance(orderCreatedAt, Date.now(), {
						addSuffix: true
					})}</time
				>
			{/if}
		</li>
	{:else}
		No transactions yet
	{/each}
</ul>
