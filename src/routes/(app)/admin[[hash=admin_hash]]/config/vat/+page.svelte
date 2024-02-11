<script lang="ts">
	import { useI18n } from '$lib/i18n.js';
	import { typedEntries } from '$lib/utils/typedEntries.js';
	import type { CountryAlpha2 } from '$lib/types/Country.js';

	export let data;

	let profile = data.vatProfiles.at(0);

	let rates = typedEntries(profile?.rates ?? {}).map(([country, rate]) => ({
		country: country as CountryAlpha2 | '',
		rate
	}));

	function onProfileChanged() {
		rates = [
			...typedEntries(profile?.rates ?? {}).map(([country, rate]) => ({ country, rate })),
			{ country: '', rate: undefined }
		];
	}

	$: onProfileChanged(), profile;

	$: if (rates.at(-1)?.country && rates.at(-1)?.rate !== undefined) {
		rates = [...rates, { country: '', rate: undefined }];
	}

	const { countryName, sortedCountryCodes } = useI18n();
</script>

<main class="max-w-7xl mx-auto px-6 w-full flex flex-col gap-4">
	<h1 class="text-3xl">Manage VAT profiles</h1>
	<p>
		You can create VAT profiles, with custom vat rates for specific countries. It is useful for
		products with specific VAT rates, like books in France and Switzerland.
	</p>

	<h2 class="text-2xl">Profiles</h2>

	{#if !profile}
		<p>No profile created yet</p>
	{:else}
		<select
			class="form-input"
			on:change={(ev) => (profile = data.vatProfiles.find((p) => p._id === ev.currentTarget.value))}
		>
			{#each data.vatProfiles as profile}
				<option value={profile._id}>{profile.name}</option>
			{/each}
		</select>

		<form method="post" class="contents">
			<input type="hidden" name="profileId" value={profile._id} />

			<label class="form-label">
				Profile name
				<input class="form-input" type="text" name="name" value={profile.name} required />
			</label>

			<div class="grid grid-cols-2 gap-2">
				{#each rates as item, i}
					<label class="form-label">
						Country
						<select class="form-input" bind:value={item.country}>
							{#each sortedCountryCodes() as code}
								<option value={code}>{countryName(code)}</option>
							{/each}
						</select>
					</label>

					<label class="form-label">
						VAT rate
						<input
							class="form-input"
							type="number"
							step="0.01"
							min="0"
							max="100"
							name="rates[{item.country}]"
							disabled={!rates[i].country}
							bind:value={rates[i].rate}
							required
						/>
					</label>
				{/each}
			</div>
			<div class="flex items-center">
				<button class="btn btn-black" formaction="?/saveProfile" formmethod="post"> Save </button>
				<button class="btn btn-red ml-auto" formaction="?/deleteProfile" formmethod="post">
					Delete
				</button>
			</div>
		</form>
	{/if}

	<h2 class="text-2xl">Create new profile</h2>
	<form method="post" class="contents" action="?/createProfile">
		<label class="form-label">
			Profile name
			<input class="form-input" type="text" name="name" placeholder="Profile name" required />
		</label>

		<input type="submit" class="btn btn-black self-start" value="Create" />
	</form>
</main>
