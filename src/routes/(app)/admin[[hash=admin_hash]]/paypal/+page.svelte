<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency';

	export let data;
</script>

<h1 class="text-3xl">Paypal</h1>

<form class="contents" method="post" action="?/save">
	<label class="form-label">
		Client ID
		<input class="form-input" type="text" name="clientId" value={data.paypal.clientId} required />
	</label>

	<label class="form-label">
		Secret
		<input class="form-input" type="text" name="secret" value={data.paypal.secret} required />
	</label>

	<label class="checkbox-label">
		<input
			class="form-checkbox"
			type="checkbox"
			name="sandbox"
			bind:checked={data.paypal.sandbox}
			value="true"
		/>
		Those credentials are for the sandbox environment
	</label>

	<label class="form-label">
		Currency
		<select class="form-input" name="currency" bind:value={data.paypal.currency} required>
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
