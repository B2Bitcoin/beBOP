<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Bity</h1>

<a href="{data.adminPrefix}/identity" class="btn btn-black self-start">Set identity</a>

<a href="{data.adminPrefix}/bity/cash-in" class="btn btn-blue self-start">Cash in</a>

{#if data.hasIBAN && data.bity.clientId}
	<a href="{data.adminPrefix}/bity/cash-out" class="btn btn-red self-start">Cash out</a>
{:else if !data.hasIBAN}
	<p class="text-red-500">You need to set your IBAN to cash out</p>
{:else if !data.bity.clientId}
	<p class="text-red-500">
		You need to set create a Bity account to cash out and configure your Bity Client ID
	</p>
{/if}

<h2 class="text-2xl">Configuration</h2>

<form class="contents" method="post" action="?/save">
	<label class="form-label">
		Bity Client ID
		<input
			class="form-input"
			type="text"
			name="clientId"
			value={data.bity.clientId}
			placeholder="bity_..."
			required
		/>
	</label>

	<div class="flex justify-between">
		<button class="btn btn-black" type="submit">Save</button>
		<button class="btn btn-red" type="submit" form="delete-form">Reset</button>
	</div>
</form>

<form class="contents" method="post" action="?/delete" id="delete-form"></form>
