<script lang="ts">
	import { enhance } from '$app/forms';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import { CURRENCIES } from '$lib/types/Currency';
	import { formatDistance } from 'date-fns';
	import { exchangeRate } from '$lib/stores/exchangeRate';
	import { useI18n } from '$lib/i18n.js';

	export let data;
	export let form;

	let vatExempted = data.vatExempted;
	let vatSingleCountry = data.vatSingleCountry;
	let priceReferenceCurrency = data.currencies.priceReference;

	async function onOverwrite(event: Event) {
		if (!confirm('Do you want to overwrite current product currencies with this one?')) {
			event.preventDefault();
		}
	}

	const { countryName, sortedCountryCodes } = useI18n();
</script>

<h1 class="text-3xl">Config</h1>

{#if form?.success}
	<div class="alert alert-success">{form.success}</div>
{/if}

<a href="{data.adminPrefix}/config/delivery" class="underline">Deliver fees</a>

<p>Configured URL: {data.origin}</p>

<div>
	Exchange Rate: <pre>{JSON.stringify($exchangeRate, null, 2)}</pre>
</div>

<form method="post" id="overwrite" action="?/overwriteCurrency" on:submit={onOverwrite} use:enhance>
	<input type="hidden" value={priceReferenceCurrency} name="priceReferenceCurrency" />
</form>

<form method="post" action="?/update" class="flex flex-col gap-6">
	<label class="form-label">
		Main currency
		<select name="mainCurrency" class="form-input max-w-[25rem]">
			{#each CURRENCIES.filter((c) => c !== 'SAT') as currency}
				<option value={currency} selected={data.currencies.main === currency}>{currency}</option>
			{/each}
		</select>
	</label>

	<label class="form-label">
		Secondary currency
		<select name="secondaryCurrency" class="form-input max-w-[25rem]">
			<option value="" selected={!data.currencies.secondary} />
			{#each CURRENCIES.filter((c) => c !== 'SAT') as currency}
				<option value={currency} selected={data.currencies.secondary === currency}
					>{currency}</option
				>
			{/each}
		</select>
	</label>

	<label class="form-label">
		Price reference currency (to avoid exchange rate fluctuations)
		<div class="flex gap-2">
			<select
				name="priceReferenceCurrency"
				bind:value={priceReferenceCurrency}
				class="form-input max-w-[25rem]"
			>
				{#each CURRENCIES as currency}
					<option value={currency}>
						{currency}
					</option>
				{/each}
			</select>
			<button type="submit" class="btn btn-red self-start" form="overwrite">
				<IconRefresh />
			</button>
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
	<p>
		Create a fullScreen CMS page with "maintenance" slug, to show maintenance page, by following
		<a href="/admin/cms/new" class="body-hyperlink underline">this link</a>.
	</p>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="displayNewsletterCommercialProspection"
			class="form-checkbox"
			checked={data.displayNewsletterCommercialProspection}
		/>
		Display newsletter + commercial prospection option (disabled by default)
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
			({countryName(data.countryCode || '-')})
		</p>
	</label>
	<div class="flex flex-col gap-2">
		<label class="checkbox-label">
			<input
				type="checkbox"
				name="collectIPOnDeliverylessOrders"
				class="form-checkbox"
				checked={data.collectIPOnDeliverylessOrders}
			/>
			Request IP collection on deliveryless order
		</label>

		<label class="checkbox-label">
			<input
				type="checkbox"
				name="isBillingAddressMandatory"
				class="form-checkbox"
				checked={data.isBillingAddressMandatory}
			/>
			Mandatory billing address
		</label>
		<label class="checkbox-label">
			<input type="checkbox" name="vatExempted" class="form-checkbox" bind:checked={vatExempted} />
			Disable VAT for my beBOP
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
			<label class="checkbox-label">
				<input
					type="checkbox"
					name="vatNullOutsideSellerCountry"
					class="form-checkbox"
					bind:checked={data.vatNullOutsideSellerCountry}
				/>
				Make VAT = 0% for deliveries outside seller's country
			</label>
			{#if vatSingleCountry}
				<label class="form-label">
					Seller's country for VAT purposes
					<select name="vatCountry" class="form-input">
						{#each sortedCountryCodes() as countryCode}
							<option value={countryCode} selected={data.vatCountry === countryCode}>
								{countryName(countryCode)}
							</option>
						{/each}
					</select>
				</label>
			{/if}
		{/if}
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

	<div class="form-label">
		Confirmation blocks

		<input
			type="number"
			class="form-input"
			value={data.confirmationBlocksThresholds.defaultBlocks}
			disabled
		/>

		<div class="grid grid-cols-3 gap-2">
			{#each data.confirmationBlocksThresholds.thresholds as threshold}
				<input
					class="form-input"
					disabled
					type="text"
					value="{threshold.minAmount} {data.confirmationBlocksThresholds.currency}"
				/>
				<input
					class="form-input"
					disabled
					type="text"
					value="{threshold.maxAmount} {data.confirmationBlocksThresholds.currency}"
				/>
				<input class="form-input" disabled type="number" value={threshold.confirmationBlocks} />
			{/each}
		</div>

		<a href="{data.adminPrefix}/config/confirmation-threshold" class="underline">
			Manage confirmation thresholds
		</a>
		<p class="text-sm">You can set a different number of confirmations for different amounts.</p>
	</div>

	<label class="form-label">
		Set desired timeout for payment (in minutes)
		<input
			type="number"
			min="0"
			step="1"
			name="desiredPaymentTimeout"
			class="form-input max-w-[25rem]"
			value={data.desiredPaymentTimeout}
		/>
	</label>
	<label class="form-label">
		How much time a cart reserves the stock (in minutes)
		<input
			type="number"
			min="0"
			step="1"
			name="reserveStockInMinutes"
			class="form-input max-w-[25rem]"
			value={data.reserveStockInMinutes}
		/>
		<p class="text-sm">The cart's reservation is extended each time the cart is updated.</p>
	</label>
	<label class="form-label">
		Admin hash

		<input
			type="text"
			name="adminHash"
			class="form-input max-w-[25rem]"
			value={data.adminHash}
			placeholder="xxxxxxxx"
			pattern="[a-zA-Z0-9]+"
		/>
		<p class="text-sm">
			This will change the admin url to
			<kbd class="px-2 py-1.5 text-xs font-semibold bg-gray-100 border border-gray-200 rounded-lg">
				/admin-[hash]
			</kbd>
		</p>
	</label>
	<label class="form-label">
		Plausible script url
		<input
			type="text"
			class="form-input max-w-[25rem]"
			name="plausibleScriptUrl"
			placeholder="https://plausible.yourdomain.com/js/script.js"
			value={data.plausibleScriptUrl}
		/>
	</label>
	<input type="submit" value="Update" class="btn btn-gray self-start" />
</form>

<p>
	IP2Location LITE data available from <a href="https://lite.ip2location.com" class="text-blue">
		https://lite.ip2location.com
	</a> is used to determine your country from your IP.
</p>
