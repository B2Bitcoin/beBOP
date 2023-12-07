<script lang="ts">
	import { countryNameByAlpha2 } from '$lib/types/Country';

	export let data;

	let id = data.sellerIdentity;

	let iban = id?.bank?.iban ?? '';
	let bic = id?.bank?.bic ?? '';
</script>

<h1 class="text-3xl">Seller identity</h1>

<form class="contents" method="post">
	<h2 class="text-2xl">Legal information</h2>

	<label class="form-label">
		Business name
		<input
			type="text"
			name="businessName"
			class="form-input max-w-[25rem]"
			required
			value={id?.businessName ?? ''}
		/>
	</label>

	<label class="form-label">
		VAT number
		<input
			type="text"
			name="vatNumber"
			class="form-input max-w-[25rem]"
			value={id?.vatNumber ?? ''}
		/>
	</label>

	<h2 class="text-2xl">Company address</h2>

	<label class="form-label">
		Street
		<input
			type="text"
			name="address.street"
			class="form-input max-w-[25rem]"
			required
			value={id?.address.street ?? ''}
		/>
	</label>

	<label class="form-label">
		Country
		<select name="address.country" class="form-input max-w-[25rem]">
			{#each Object.entries(countryNameByAlpha2) as [countryCode, countryName]}
				<option value={countryCode} selected={countryCode === id?.address?.country}
					>{countryName}</option
				>
			{/each}
		</select>
	</label>

	<div class="flex flex-wrap gap-2">
		<label class="form-label">
			State
			<input
				type="text"
				name="address.state"
				class="form-input max-w-[25rem]"
				value={id?.address.state ?? ''}
			/>
		</label>

		<label class="form-label">
			City
			<input
				type="text"
				name="address.city"
				class="form-input max-w-[25rem]"
				required
				value={id?.address.city ?? ''}
			/>
		</label>

		<label class="form-label">
			ZIP code
			<input
				type="text"
				name="address.zip"
				class="form-input max-w-[25rem]"
				required
				value={id?.address.zip ?? ''}
			/>
		</label>
	</div>

	<h2 class="text-2xl">Contact information</h2>

	<label class="form-label">
		Email
		<input
			type="email"
			name="contact.email"
			class="form-input max-w-[25rem]"
			required
			value={id?.contact.email ?? ''}
		/>
	</label>

	<label class="form-label">
		Phone
		<input
			type="tel"
			name="contact.phone"
			class="form-input max-w-[25rem]"
			value={id?.contact.phone ?? ''}
		/>
	</label>

	<h2 class="text-2xl">Bank account</h2>

	<label class="form-label">
		IBAN
		<input
			type="text"
			name="bank.iban"
			class="form-input max-w-[25rem]"
			bind:value={iban}
			required={!!bic}
		/>
	</label>

	<label class="form-label">
		BIC
		<input
			type="text"
			name="bank.bic"
			class="form-input max-w-[25rem]"
			bind:value={bic}
			required={!!iban}
		/>
	</label>

	<h2 class="text-2xl">Invoice Information</h2>

	<label class="form-label">
		Very-top-right issuer information
		<textarea
			name="invoice.issuerInfo"
			class="form-input max-w-[25rem]"
			rows="5"
			value={id?.invoice?.issuerInfo ?? ''}
		/>
		<p class="text-sm">
			This is completely optional. It will be printed on the top-right corner of the invoice.
		</p>
	</label>

	<button type="submit" class="btn btn-black self-start">Update</button>
</form>
