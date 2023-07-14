<script lang="ts">
	import PriceTag from '$lib/components/PriceTag.svelte';
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
			{#if data.currentWallet === wallet}
				<li class="font-bold">{wallet}</li>
			{:else}
				<li class="flex gap-2">
					{wallet}
					<form action="?/setCurrentWallet" method="post">
						<input type="hidden" value={wallet} name="wallet" /><button
							type="submit"
							class="text-link underline">select</button
						>
					</form>
				</li>
			{/if}
		{/each}
	</ul>

	<p>
		Changing wallet in an active bootik means that incoming transactions in the old wallet will not
		be detected
	</p>
{/if}

<form action="?/createWallet" method="post" on:submit|preventDefault={inputWalletName}>
	<input type="hidden" name="wallet" value={walletToCreate} />
	<button class="btn btn-black">Create wallet</button>
</form>

<h2 class="text-2xl">Balance</h2>

<PriceTag amount={data.balance} currency="BTC" />

<h2 class="text-2xl">Transactions</h2>

<ul>
	{#each data.transactions as transaction}
		<li>
			Amount: {transaction.amount}
			{#if data.priceReferenceCurrency !== 'BTC'}(<PriceTag
					currency="BTC"
					amount={transaction.amount}
					convertedTo={data.priceReferenceCurrency}
				/>){/if} / Txid:
			<a
				class="underline text-link"
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
