<script lang="ts">
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { formatDistance } from 'date-fns';

	export let data;

	let orderById = Object.fromEntries([...data.orders].map((order) => [order._id, order]));
</script>

<h1 class="text-3xl">Bitcoin node</h1>

<h2 class="text-2xl">Chain</h2>

<ul>
	<li>Blocks: {data.blockchainInfo.blocks.toLocaleString('en')}</li>
	<li>Chain: {data.blockchainInfo.chain}</li>
</ul>

<h2 class="text-2xl">Wallet</h2>

<ul>
	{#each data.wallets as wallet}
		<li>{wallet}</li>
	{:else}
		<form action="?/createWallet" method="post">
			<button class="btn btn-black">Create wallet</button>
		</form>
	{/each}
</ul>

<h2 class="text-2xl">Balance</h2>

<PriceTag amount={data.balance} currency="BTC" />

<h2 class="text-2xl">Transactions</h2>

<ul>
	{#each data.transactions as transaction}
		<li>
			Amount: {transaction.amount} / Txid:
			<a
				class="underline text-blue"
				href="https://www.blockchain.com/en/explorer/transactions/{data.blockchainInfo.chain ===
				'test'
					? 'btc-testnet'
					: 'btc'}/{transaction.txid}">{transaction.txid}</a
			>
			{#if transaction.label.startsWith('order:') && orderById[transaction.label.slice('order:'.length)]}
				{@const orderCreatedAt = orderById[transaction.label.slice('order:'.length)].createdAt}
				/
				<a class="underline text-blue" href="/order/{transaction.label.slice('order:'.length)}"
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
