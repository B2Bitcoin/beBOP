<script lang="ts">
	import { bech32 } from 'bech32';
	export let data;
	export let form;

	async function createNostrKey() {
		const hex = crypto.getRandomValues(new Uint8Array(32));

		prompt('Your NostR private key is:', bech32.encode('nsec', bech32.toWords(hex)));
	}
</script>

<h1 class="text-3xl">NostR</h1>

{#if form?.success}
	<p class="border border-green-400 p-2 text-green-600 rounded">
		{form.success}
	</p>
{/if}

{#if data.nostrPrivateKey}
	<p>Your NostR private key is: {data.nostrPrivateKey}</p>
	<p>Your NostR public key is: {data.nostrPublicKey}</p>

	<h2 class="text-2xl">Send message</h2>

	<form action="?/sendMessage" method="post" class="flex flex-col gap-4">
		<label>
			NPUB
			<input
				class="form-input"
				type="text"
				name="npub"
				placeholder="npubXXXXXXXXXXXXXXXXXXXXXXXXXX"
				required
			/>
		</label>

		<label>
			Message
			<input class="form-input" type="text" name="message" required />
		</label>

		<button class="btn btn-black self-start" type="submit">Send</button>
	</form>
{:else}
	<p>You don't have a NostR private key yet.</p>
	<button class="btn btn-black self-start" type="button" on:click={createNostrKey}
		>Create NostR private key</button
	>
{/if}

<h2 class="text-2xl">Relays</h2>

<ul>
	{#each data.nostrRelays as relay}
		<li>{relay}</li>
	{/each}
</ul>
