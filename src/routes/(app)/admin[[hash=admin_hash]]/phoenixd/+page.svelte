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
	<form class="contents" method="POST" action="?/update">
		<label class="form-label">
			Payment method label
			<input
				type="text"
				class="form-input"
				name="paymentMethodLabel"
				value={data.phoenixd.paymentMethodLabel}
				required
			/>
		</label>

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
{/if}
