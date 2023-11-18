<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency';

	export let data;

	let cashinAmount = 200;
</script>

<h1 class="text-3xl">Bitcoin node - Bity cash in</h1>

<p>
	In order to manage on-chain refunds and cross -beBOP automatic invoices, you might need to keep a
	certain amount on your bitcoin wallet.
</p>

<p>
	In the case where you've already cashed out all or most of it, you can cash-in some fresh BTC/SATs
	on your wallet through BITY from flat payment or bank transfer.
</p>

<a
	href="https://help.bity.com/en/articles/1502287-how-do-i-buy-cryptocurrencies"
	target="_blank"
	class="underline">Functional documentation</a
>

<p>
	<span class="font-bold">Important:</span> To avoid cash-in fees, always keep a small amount of BTC
	on your wallet and avoid cashing out everything.
</p>

<h2 class="text-2xl">Cash-in amount</h2>

<p>Select the amount you want to cash-in:</p>

<div class="flex gap-2 max-w-7xl">
	<label class="form-label grow basis-0">
		Cash-in amount

		<input type="number" class="form-input" bind:value={cashinAmount} min="0" step="1" required />
	</label>

	<label class="form-label grow basis-0">
		Currency

		<select class="form-input">
			{#each CURRENCIES.filter((c) => c !== 'BTC' && c !== 'SAT') as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</label>
</div>
