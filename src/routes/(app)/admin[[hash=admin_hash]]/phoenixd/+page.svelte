<script lang="ts">
	import { page } from '$app/stores';

	export let data;
	export let form;
</script>

<h1 class="text-3xl">PhoenixD</h1>

{#if !data.phoenixd.enabled}
	<p>
		PhoenixD is not active yet. Follow <a
			href="https://phoenix.acinq.co/server/get-started"
			class="body-hyperlink underline">this procedure</a
		> to install it on the same server as beBOP.
	</p>

	<p>Once done, click on "Detect PhoenixD Server" button</p>

	<form method="POST" action="?/detect">
		<button class="btn btn-black" type="submit">Detect PhoenixD Server</button>
	</form>

	{#if $page.status >= 400 && form?.message}
		<p class="text-red-500">{form.message}</p>
	{/if}
{:else}
	<p>Note that PhoenixD lightning payments have a max expiration of one hour.</p>
	<form class="contents" method="POST" action="?/update">
		<label class="form-label">
			PhoenixD http password (from phoenix.conf)
			<input
				type="text"
				name="password"
				class="form-input"
				value={data.phoenixd.password}
				required
			/>
		</label>

		<div class="flex gap-2">
			<button class="btn btn-black" type="submit">Save</button>
			<button class="btn btn-red" type="submit" form="disableForm">Reset</button>
		</div>
	</form>
	<form method="POST" action="?/disable" id="disableForm"></form>

	{#if data.nodeInfo === null}
		<p class="text-red-500">
			There was an error, check your http password and if PhoenixD is running/listening on port
			9740.
		</p>
	{:else if data.nodeInfo}
		<h2 class="text-2xl">Node info</h2>
		<pre>{JSON.stringify(data.nodeInfo, null, 2)}</pre>
	{/if}

	{#if data.balance}
		<h2 class="text-2xl">Balance</h2>
		<pre>{JSON.stringify(data.balance, null, 2)}</pre>
	{/if}
{/if}
