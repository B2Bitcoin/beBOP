<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	export let data;
	export let form;

	let withdrawDialog: HTMLDialogElement | null;

	let recommendedFeeRate = 0;

	function showDialog() {
		withdrawDialog?.showModal();

		fetch('https://mempool.space/api/v1/fees/recommended')
			.then((res) => res.json())
			.then((data) => {
				recommendedFeeRate = data.hourFee;
			});
	}

	let withdrawMode = 'bolt11' as 'bolt11' | 'bitcoin';
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

			{#if data.nodeInfo}
				<button class="btn btn-blue ml-auto" type="button" on:click={() => showDialog()}
					>Withdraw</button
				>
			{/if}
		</div>
	</form>
	<form method="POST" action="?/disable" id="disableForm"></form>
	<dialog bind:this={withdrawDialog} class="max-w-full w-[500px] rounded">
		<form
			method="POST"
			action="?/withdraw"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'error') {
						alert(result.error?.message ?? JSON.stringify(result.error));
					} else if (result.type === 'success') {
						console.log(result.data);
						alert('Withdrawal successful\n\n' + JSON.stringify(result.data, null, 2));
						withdrawDialog?.close();
					}
				};
			}}
			class="flex flex-col gap-2"
		>
			<label class="checkbox-label">
				<input
					type="radio"
					bind:group={withdrawMode}
					class="form-radio"
					name="withdrawMode"
					value="bolt11"
				/>
				Lightning
			</label>

			<label class="checkbox-label">
				<input
					type="radio"
					bind:group={withdrawMode}
					class="form-radio"
					name="withdrawMode"
					value="bitcoin"
				/>
				Bitcoin
			</label>

			{#if withdrawMode === 'bitcoin'}
				<label class="form-label">
					Address
					<input type="text" name="address" class="form-input" placeholder="bc1p..." required />
				</label>

				<label class="form-label">
					Amount (sats)
					<input type="number" name="amount" class="form-input" required />
				</label>

				<label class="form-label">
					Fee rate (sats/vbyte)
					<input
						type="number"
						name="feeRate"
						class="form-input"
						placeholder={recommendedFeeRate ? '' + recommendedFeeRate : ''}
						required
					/>
					<p>
						Checkout
						<a href="https://mempool.space" class="body-hyperlink" target="_blank">mempool.space</a>
						to choose a fee rate.
					</p>
				</label>
			{:else}
				<label class="form-label">
					Bolt11 Lightning invoice
					<input type="text" name="address" class="form-input" placeholder="lnbc..." required />
				</label>

				<label class="form-label">
					Amount (sats)
					<input
						type="number"
						name="amount"
						class="form-input"
						placeholder="optional, if not set determined by the invoice"
					/>
				</label>
			{/if}

			<div class="flex gap-2">
				<button class="btn btn-black" type="submit">Withdraw</button>

				<button class="btn btn-gray ml-auto" type="button" on:click={() => withdrawDialog?.close()}
					>Cancel</button
				>
			</div>
		</form>
	</dialog>

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
