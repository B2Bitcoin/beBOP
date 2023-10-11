<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
	let createUser = false;
	let formAuthLink: HTMLFormElement;
</script>

<h1 class="text-2xl">Link Authentification</h1>

<div class="flex justify-center items-center">
	<form method="post" class="flex-col gap-4 p-6 w-[40em]" bind:this={formAuthLink}>
		<label class="form-label">
			Address (email, nostr or phone):
			<input class="form-input" type="text" name="login" placeholder="Enter the address" required />
		</label>
		<label class="checkbox-label">
			<input class="form-checkbox" type="checkbox" bind:checked={createUser} name="createUser" />
			Create new user on session request
		</label>
		<div class="flex-wrap text-center">
			{#if form?.successExistUser}
				<p class="text-green-500">
					If your account does exist, you'll receive a session link on your address
				</p>
			{/if}
			{#if form?.successNewUser}
				<p class="text-green-500">you'll receive a session link on your address</p>
			{/if}
			{#if form?.fail}
				<p class="text-red-500">Sorry, user with this information doesn't exist.</p>
			{/if}
		</div>
		<div class="flex justify-center gap-4 mt-2">
			<input type="submit" class="btn btn-blue text-white" value="Login" />
			<button class="btn btn-gray"><a href="/">Cancel</a></button>
		</div>
	</form>
</div>
