<script lang="ts">
	import PriceTag from '$lib/components/PriceTag.svelte';

	export let data;
</script>

<main class="p-4 flex flex-col gap-4">
	<h1 class="text-3xl">Bitcoin node</h1>

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
				Amount: {transaction.amount} / Txid: {transaction.txid}
				{#if transaction.label.startsWith('order:')}
					/ <a class="underline text-blue" href="/order/{transaction.label.slice('order:'.length)}"
						>Order</a
					>{/if}
			</li>
		{:else}
			No transactions yet
		{/each}
	</ul>
</main>
