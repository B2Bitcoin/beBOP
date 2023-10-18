<script lang="ts">
	import { page } from '$app/stores';
	export let form;
	export let data;
</script>

<div class="max-w-3xl mx-auto p-6 flex flex-col gap-4">
	{#if form?.error || data?.error}
		<p class="text-red-500">{form?.error || data?.error}</p>
	{/if}
	{#if data.email || data.npub}
		<h2 class="text-2xl">Session</h2>
		<ul class="list-disc ml-4">
			{#if data.email}<li>Email: {data.email}</li>{/if}
			{#if data.npub}<li>Npub: {data.npub}</li>{/if}
		</ul>
	{/if}
	{#if data.emailToLogin || data.npubToLogin}
		<form method="post" action="?/validate&token={$page.url.searchParams.get('token')}">
			<button class="btn btn-blue text-white">
				Authenticate as {data.emailToLogin || data.npubToLogin}
			</button>
		</form>
	{:else}
		<h2 class="text-2xl">Add authentication</h2>
		<form method="post" class="flex flex-col gap-4" action="?/sendLink">
			<label class="form-label">
				Email or npub
				<input
					class="form-input"
					type="text"
					name="address"
					placeholder="Enter the address"
					required
				/>
			</label>
			{#if form?.successUser}
				<p class="text-green-500">You will receive a session link on your address</p>
			{/if}
			<div class="flex gap-4">
				<input type="submit" class="btn btn-blue text-white" value="Send Authentication Link" />
				<button class="btn btn-gray"><a href="/">Cancel</a></button>
			</div>
		</form>
	{/if}
</div>
