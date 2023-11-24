<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency';

	export let data;
</script>

<h1 class="text-3xl">SumUp</h1>

<form class="contents" method="post" action="?/save">
	<label class="form-label">
		API Key
		<input
			class="form-input"
			type="text"
			name="apiKey"
			value={data.sumUp.apiKey}
			placeholder="sup_sk_..."
			required
		/>
	</label>

	<label class="form-label">
		Merchant Code
		<input
			class="form-input"
			type="text"
			name="merchantCode"
			value={data.sumUp.merchantCode}
			placeholder="MXXXXXX"
			required
		/>
	</label>

	<label class="form-label">
		Currency
		<select class="form-input" name="currency" bind:value={data.sumUp.currency} required>
			{#each CURRENCIES.filter((c) => c !== 'BTC' && c !== 'SAT') as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</label>

	<div class="flex justify-between">
		<button class="btn btn-black" type="submit">Save</button>
		<button class="btn btn-red" type="submit" form="delete-form">Reset</button>
	</div>
</form>
<form class="contents" method="post" action="?/delete" id="delete-form"></form>
