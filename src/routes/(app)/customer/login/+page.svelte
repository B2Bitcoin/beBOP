<script lang="ts">
	import IconFacebook from '$lib/components/icons/IconFacebook.svelte';
	import IconGithub from '$lib/components/icons/IconGithub.svelte';
	import IconGoogle from '$lib/components/icons/IconGoogle.svelte';
	import IconTwitter from '$lib/components/icons/IconTwitter.svelte';
	import type { ActionData } from './$types';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

	export let form: ActionData;
	let formAuthLink: HTMLFormElement;
</script>

<h1 class="text-2xl">Authentification</h1>

<div class="flex justify-center items-center">
	<form method="post" class="flex-col gap-4 p-6 w-[40em]" bind:this={formAuthLink}>
		<h1 class="text-2xl">Receive Authentification Link</h1>
		<br />

		<label class="form-label">
			Address (email, nostr or phone):
			<input
				class="form-input"
				type="text"
				name="address"
				placeholder="Enter the address"
				required
			/>
		</label>
		<div class="flex-wrap text-center">
			{#if form?.successExistUser}
				<p class="text-green-500">
					If your account does exist, you'll receive a session link on your address
				</p>
			{/if}
			{#if form?.successUser}
				<p class="text-green-500">you'll receive a session link on your address</p>
			{/if}
			{#if form?.cannotCreateUser}
				<p class="text-red-500">Sadly, no information was found about your contact.</p>
			{/if}
			{#if form?.fail}
				<p class="text-red-500">Sorry, An error happen try again.</p>
			{/if}
		</div>
		<div class="flex justify-center gap-4 mt-2">
			<input type="submit" class="btn btn-blue text-white" value="Login" />
			<button class="btn btn-gray"><a href="/">Cancel</a></button>
		</div>
	</form>
</div>
<div class="flex justify-center items-center">
	<div class="flex-col gap-4 p-6 w-[40em]">
		{#if $page.data.sessionSvelteKit}
			<span class="signedInText">
				<small>Signed in as</small><br />
				<strong>{$page.data.sessionSvelteKit.user?.name ?? 'User'}</strong>
			</span>
			<button on:click={() => signOut()} class="button">Sign out</button>
		{:else}
			<div class="flex justify-center gap-4 mt-2">
				<button class="btn btn-gray w-[15em]" on:click={() => signIn('google')}
					><IconGoogle />Sign In With Google</button
				>
			</div>
			<div class="flex justify-center gap-4 mt-2">
				<button class="btn btn-gray w-[15em]" on:click={() => signIn('facebook')}
					><IconFacebook /> Sign In With Facebook</button
				>
			</div>
			<div class="flex justify-center gap-4 mt-2">
				<button class="btn btn-gray w-[15em]" on:click={() => signIn('twitter')}
					><IconTwitter /> Sign In With Twitter</button
				>
			</div>
			<div class="flex justify-center gap-4 mt-2">
				<button class="btn btn-gray w-[15em]" on:click={() => signIn('github')}
					><IconGithub /> Sign In With Github</button
				>
			</div>
		{/if}
	</div>
</div>
