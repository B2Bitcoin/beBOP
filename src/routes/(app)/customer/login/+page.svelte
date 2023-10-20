<script lang="ts">
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import IconFacebook from '~icons/ant-design/facebook-filled';
	import IconGithub from '~icons/ant-design/github-outlined';
	import IconGoogle from '~icons/ant-design/google-outlined';
	import IconTwitter from '~icons/ant-design/twitter-outlined';

	export let form;
	export let data;
</script>

<div class="max-w-3xl mx-auto p-6 flex flex-col gap-4">
	{#if form?.error || data?.error}
		<p class="text-red-500">{form?.error || data?.error}</p>
	{/if}
	{#if data.email || data.npub || data.sso?.length}
		<h2 class="text-2xl">Session</h2>
		<ul class="list-disc ml-4">
			{#if data.email}<li>Email: {data.email}</li>{/if}
			{#if data.npub}<li>Npub: {data.npub}</li>{/if}
			{#each data.sso || [] as { provider, email, name }}
				<li>
					{provider}: {email || 'no-email'} ({name})
				</li>
			{/each}
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

		{#if data.canSso.github || data.canSso.google || data.canSso.facebook || data.canSso.twitter}
			<h2 class="text-2xl">Or sign in with</h2>

			<div class="flex flex-col gap-4 mt-4 self-center">
				{#if data.canSso.google}
					<button class="btn btn-gray" on:click={() => signIn('google')}>
						<IconGoogle class="text-[#db4437] mr-2" />Sign In With Google
					</button>
				{/if}
				{#if data.canSso.facebook}
					<button class="btn btn-gray" on:click={() => signIn('facebook')}>
						<IconFacebook class="text-[#4267B2] mr-2" /> Sign In With Facebook
					</button>
				{/if}
				{#if data.canSso.twitter}
					<button class="btn btn-gray" on:click={() => signIn('twitter')}>
						<IconTwitter class="text-[#1DA1F2] mr-2" /> Sign In With Twitter
					</button>
				{/if}
				{#if data.canSso.github}
					<button class="btn btn-gray" on:click={() => signIn('github')}>
						<IconGithub class="mr-2" /> Sign In With Github
					</button>
				{/if}
			</div>
		{/if}
	{/if}
</div>
