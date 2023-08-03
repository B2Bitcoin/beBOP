<script lang="ts">
	import { CURRENCIES } from '$lib/types/Currency';
	import { formatDistance } from 'date-fns';
	import Tags from 'svelte-tags-input';

	export let data;

	let vatExempted = data.vatExempted;
	let vatSingleCountry = data.vatSingleCountry;
	let enableRelayPoint = false;
	let restrictBootikAge = false;
	let enableCardPayment = false;
	let applyUpdatesAuto = false;
	let saveIp = false;
	let mandatoryBilingAddress = false;
	let enableGoogleShoppingExport = false;

	function onOverwrite(event: Event) {
		if (!confirm('Do you want to overwrite current product currencies with this one?')) {
			event.preventDefault();
		}
	}
</script>

<h1 class="text-3xl">Config</h1>

<a href="/admin/config/delivery" class="underline">Deliver fees</a>

<p>Configured URL: {data.origin}</p>

<div>
	Exchange Rate: <pre>{JSON.stringify(data.exchangeRate, null, 2)}</pre>
</div>

<form method="post" class="flex flex-col gap-6">
	<label class="form-label">
		Main currency
		<select name="mainCurrency" class="form-input max-w-[25rem]">
			{#each CURRENCIES.filter((c) => c !== 'SAT') as currency}
				<option value={currency} selected={data.mainCurrency === currency}>{currency}</option>
			{/each}
		</select>
	</label>

	<label class="form-label">
		Secondary currency
		<select name="secondaryCurrency" class="form-input max-w-[25rem]">
			<option value="" selected={!data.secondaryCurrency} />
			{#each CURRENCIES.filter((c) => c !== 'SAT') as currency}
				<option value={currency} selected={data.secondaryCurrency === currency}>{currency}</option>
			{/each}
		</select>
	</label>
	<label class="form-label">
		Price reference currency (to avoid exchange rate fluctuations)
		<div class="flex gap-2">
			<select name="priceReferenceCurrency" class="form-input max-w-[25rem]">
				{#each CURRENCIES as currency}
					<option value={currency} selected={data.priceReferenceCurrency === currency}>
						{currency}
					</option>
				{/each}
			</select>
			<input
				type="button"
				on:click={onOverwrite}
				value="Overwrite"
				class="btn btn-blue self-start"
			/>
		</div>
	</label>

	<label class="checkbox-label">
		<input
			type="checkbox"
			name="checkoutButtonOnProductPage"
			class="form-checkbox"
			checked={data.checkoutButtonOnProductPage}
		/>
		checkoutButtonOnProductPage
	</label>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="includeOrderUrlInQRCode"
			class="form-checkbox"
			checked={data.includeOrderUrlInQRCode}
		/>
		includeOrderUrlInQRCode
	</label>
	<label class="checkbox-label">
		<input type="checkbox" name="discovery" class="form-checkbox" checked={data.discovery} />
		discovery
	</label>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="enableCashSales"
			class="form-checkbox"
			checked={data.enableCashSales}
		/>
		enableCashSales
	</label>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="isMaintenance"
			class="form-checkbox"
			checked={data.isMaintenance}
		/>
		isMaintenance
	</label>
	<label class="form-label">
		Maintenance IPs, comma-separated
		<input
			type="text"
			class="form-input max-w-[25rem]"
			name="maintenanceIps"
			placeholder="x.x.x.x,y.y.y.y"
			value={data.maintenanceIps}
		/>
		<p class="text-sm">
			Your IP is <code class="font-mono bg-link px-[2px] py-[1px] rounded text-white"
				>{data.ip}</code
			>
			({data.countryName})
		</p>
	</label>
	<div class="flex flex-col gap-2">
		<label class="checkbox-label">
			<input type="checkbox" name="vatExempted" class="form-checkbox" bind:checked={vatExempted} />
			Disable VAT for my bootik
		</label>
		{#if vatExempted}
			<label class="form-label">
				VAT exemption reason (appears on the invoice)

				<input
					type="text"
					name="vatExemptionReason"
					class="form-input max-w-[25rem]"
					value={data.vatExemptionReason}
				/>
			</label>
		{:else}
			<label class="checkbox-label">
				<input
					type="checkbox"
					name="vatSingleCountry"
					class="form-checkbox"
					bind:checked={vatSingleCountry}
				/>
				Use VAT rate from seller's country
			</label>
			{#if vatSingleCountry}
				<label class="form-label">
					Seller's country for VAT purposes
					<select name="vatCountry">
						{#each Object.entries(data.countryCodes) as [countryCode, countryName]}
							<option value={countryCode} selected={data.vatCountry === countryCode}>
								{countryName}
							</option>
						{/each}
					</select>
				</label>
			{/if}
		{/if}
		<input type="button" value="VAT" class="btn btn-blue self-start" />
		<label class="checkbox-label">
			<input
				type="checkbox"
				name="enableRelayPoint"
				class="form-checkbox"
				bind:checked={enableRelayPoint}
			/>
			Enable relay point delivery
		</label>
		<label for="shoptags" class="form-label"
			>Shop tags
			<div class="max-w-[25rem]">
				<Tags />
			</div>
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				name="restrictBootikAge"
				class="form-checkbox"
				bind:checked={restrictBootikAge}
			/>
			Make bootik age-restricted
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				name="enableCardPayment"
				class="form-checkbox"
				bind:checked={enableCardPayment}
			/>
			Enable credit card payment (with Bity)
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				name="applyUpdatesAuto"
				class="form-checkbox"
				bind:checked={applyUpdatesAuto}
			/>
			Automatically apply updates from official repo
		</label>
		<label class="checkbox-label">
			<input type="checkbox" name="saveIp" class="form-checkbox" bind:checked={saveIp} />
			Save IP on order
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				name="mandatoryBilingAddress"
				class="form-checkbox"
				bind:checked={mandatoryBilingAddress}
			/>
			Mandatory biling address
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				name="enableGoogleShoppingExport"
				class="form-checkbox"
				bind:checked={enableGoogleShoppingExport}
			/>
			Enable Google Shopping export
		</label>
	</div>
	<label class="form-label">
		Subscription duration
		<select
			name="subscriptionDuration"
			class="form-input max-w-[25rem]"
			value={data.subscriptionDuration}
		>
			{#each ['month', 'day', 'hour'] as duration}
				<option value={duration}>{duration}</option>
			{/each}
		</select>
	</label>
	<label class="form-label">
		Subscription reminder
		<select
			name="subscriptionReminderSeconds"
			value={data.subscriptionReminderSeconds}
			class="form-input max-w-[25rem]"
		>
			{#each [86400 * 7, 86400 * 3, 86400, 3600, 5 * 60] as seconds}
				<option value={seconds}
					>{formatDistance(0, seconds * 1000)} before the end of the subscription</option
				>
			{/each}
		</select>
	</label>

	<label class="form-label">
		Confirmation blocks
		<input
			type="number"
			min="0"
			step="1"
			name="confirmationBlocks"
			class="form-input max-w-[25rem]"
			value={data.confirmationBlocks}
		/>
	</label>
	<input type="submit" value="Update" class="btn btn-gray self-start" />
</form>

<p>
	IP2Location LITE data available from <a href="https://lite.ip2location.com" class="text-blue">
		https://lite.ip2location.com
	</a> is used to determine your country from your IP.
</p>
