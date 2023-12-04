<script lang="ts">
	import { useI18n } from '$lib/i18n.js';
	import { COUNTRIES } from '$lib/types/Country';
	import { typedKeys } from '$lib/utils/typedKeys.js';

	export let data;

	const { t } = useI18n();
	let country = typedKeys(COUNTRIES)[0];
</script>

<main class="mx-auto max-w-7xl py-10 px-6 body-mainPlan">
	<div class="w-full rounded-xl body-mainPlan border-gray-300 p-6 md:grid gap-4 md:gap-2 flex">
		<form method="post" class="col-span-2 flex gap-4 flex-col">
			<section class="gap-4 grid grid-cols-6 w-4/5">
				<h1 class="font-light text-2xl col-span-6">Personal Information</h1>

				<label class="form-label col-span-3">
					{t('address.firstName')}
					<input
						type="text"
						class="form-input"
						name="firstName"
						autocomplete="given-name"
						required
						value={data.personalInfoConnected?.firstName}
					/>
				</label>

				<label class="form-label col-span-3">
					{t('address.lastName')}
					<input
						type="text"
						class="form-input"
						name="lastName"
						autocomplete="family-name"
						required
						value={data.personalInfoConnected?.lastname}
					/>
				</label>

				<label class="form-label col-span-6">
					{t('address.address')}
					<input
						type="text"
						class="form-input"
						autocomplete="street-address"
						name="address.street"
						required
						value={data.personalInfoConnected?.address?.street}
					/>
				</label>

				<label class="form-label col-span-3">
					{t('address.country')}
					<select name="address.country" class="form-input" required bind:value={country}>
						{#each Object.entries(COUNTRIES) as [code, countryTxt]}
							<option value={code} selected={code === data.personalInfoConnected?.address?.country}
								>{countryTxt}</option
							>
						{/each}
					</select>
				</label>

				<span class="col-span-3" />

				<label class="form-label col-span-2">
					{t('address.state')}

					<input
						type="text"
						name="address.state"
						class="form-input"
						value={data.personalInfoConnected?.address?.state}
					/>
				</label>
				<label class="form-label col-span-2">
					{t('address.city')}

					<input
						type="text"
						name="address.city"
						class="form-input"
						required
						value={data.personalInfoConnected?.address?.city}
					/>
				</label>
				<label class="form-label col-span-2">
					{t('address.zipCode')}

					<input
						type="text"
						name="address.zip"
						class="form-input"
						required
						autocomplete="postal-code"
						value={data.personalInfoConnected?.address?.zip}
					/>
				</label>
				<button type="submit" class="btn btn-black self-start">Update</button>
			</section>
		</form>
	</div>
</main>
