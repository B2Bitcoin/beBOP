<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency';

	export let data;
</script>

<h1 class="text-3xl">Stripe</h1>

<form class="contents" method="post" action="?/save">
	<label class="form-label">
		Secret Key
		<input
			class="form-input"
			type="password"
			name="secretKey"
			value={data.stripe.secretKey}
			placeholder="sk_..."
			required
		/>
	</label>

	<label class="form-label">
		Public Key
		<input
			class="form-input"
			type="text"
			name="publicKey"
			value={data.stripe.publicKey}
			placeholder="pk_..."
			required
		/>
	</label>

	<label class="form-label">
		Currency
		<select class="form-input" name="currency" bind:value={data.stripe.currency} required>
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
