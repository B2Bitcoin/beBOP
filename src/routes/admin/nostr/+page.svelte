<script lang="ts">
	import { bech32 } from 'bech32';
	export let data;

	async function createNostrKey() {
		const hex = crypto.getRandomValues(new Uint8Array(32));

		prompt('Your NostR private key is:', bech32.encode('nsec', bech32.toWords(hex)));
	}
</script>

<h1 class="text-3xl">NostR</h1>

{#if data.nostrPrivateKey}
	<p>Your NostR private key is: {data.nostrPrivateKey}</p>
	<p>Your NostR public key is: {data.nostrPublicKey}</p>
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
