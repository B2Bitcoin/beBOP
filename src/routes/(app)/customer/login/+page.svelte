<script lang="ts">
	import { page } from '$app/stores';
	export let form;
	export let data;
</script>

{#if form?.error || data?.error}
	<p class="text-red-500">{form?.error || data?.error}</p>
{/if}

{#if data.emailToLogin || data.npubToLogin}
	<form method="post" action="?/validate&token={$page.url.searchParams.get('token')}">
		<button class="btn btn-blue text-white"
			>Authenticate as {data.emailToLogin || data.npubToLogin}</button
		>
	</form>
{:else}
	<div class="flex justify-center items-center">
		<form method="post" class="flex-col gap-4 p-6 w-[40em]" action="?/sendLink">
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
			<div class="flex-wrap text-center">
				{#if form?.successUser}
					<p class="text-green-500">You will receive a session link on your address</p>
				{/if}
			</div>
			<div class="flex justify-center gap-4 mt-2">
				<input type="submit" class="btn btn-blue text-white" value="Send Authentication Link" />
				<button class="btn btn-gray"><a href="/">Cancel</a></button>
			</div>
		</form>
	</div>
{/if}
