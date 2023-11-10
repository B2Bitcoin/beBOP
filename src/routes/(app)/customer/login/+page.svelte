<script lang="ts">
	import { page } from '$app/stores';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { signIn } from '@auth/sveltekit/client';
	import IconFacebook from '~icons/ant-design/facebook-filled';
	import IconGithub from '~icons/ant-design/github-outlined';
	import IconGoogle from '~icons/ant-design/google-outlined';
	import IconTwitter from '~icons/ant-design/twitter-outlined';
	import IconTrash from '$lib/components/icons/IconTrash.svelte';
	import { enhance } from '$app/forms';
	import { t, useI18n } from '$lib/i18n.js';

	useI18n();

	export let form;
	export let data;
</script>

<div class="max-w-3xl mx-auto p-6 flex flex-col gap-4">
	{#if form?.error || data?.error}
		<p class="text-red-500">{form?.error || data?.error}</p>
	{/if}
	<h2 class="text-2xl">{t('login.session.title')}</h2>
	<ul class="list-disc ml-4">
		{#if data.userId}
			<li class="flex gap-2 items-center">
				{t('login.session.userId', { userId: data.userId })}
				<form action="?/clearUserId" class="contents" use:enhance method="post">
					<button class="text-red-500 hover:underline"><IconTrash /></button>
				</form>
			</li>
		{/if}
		{#if data.email && !data.emailFromSso}
			<li class="flex gap-2 items-center">
				{t('login.session.email', { email: data.email })}
				<form action="?/clearEmail" class="contents" use:enhance method="post">
					<button class="text-red-500 hover:underline"><IconTrash /></button>
				</form>
			</li>
		{/if}
		{#if data.npub}
			<li class="flex gap-2 items-center">
				{t('login.session.npub', { npub: data.npub })}
				<form action="?/clearNpub" class="contents" use:enhance method="post">
					<button class="text-red-500 hover:underline"><IconTrash /></button>
				</form>
			</li>
		{/if}
		{#each data.sso || [] as { provider, email, name }}
			<li class="flex gap-2 items-center">
				{upperFirst(provider)}: {email || 'no-email'} ({name})
				<form action="?/clearSso" use:enhance class="contents" method="post">
					<input type="hidden" name="provider" value={provider} />
					<button class="text-red-500 hover:underline"><IconTrash /></button>
				</form>
			</li>
		{/each}
	</ul>

	<form method="post" action="?/clearAll" use:enhance>
		<button class="btn btn-red">{t('login.cta.clearSession')}</button>
	</form>
	{#if data.emailToLogin || data.npubToLogin}
		<form method="post" action="?/validate&token={$page.url.searchParams.get('token')}">
			<button class="btn btn-blue text-white">
				{t('login.cta.authenticateAs', { as: data.emailToLogin || data.npubToLogin })}
			</button>
		</form>
	{:else}
		<h2 class="text-2xl">{t('login.authenticate.title')}</h2>
		<form method="post" class="flex flex-col gap-4" action="?/sendLink">
			<label class="form-label">
				{t('login.authenticate.inputLabel')}
				<input
					class="form-input"
					type="text"
					name="address"
					placeholder="test@example.com"
					required
				/>
			</label>
			{#if form?.successUser}
				<p class="text-green-500">{t('login.willReceiveSessionLink')}</p>
			{/if}
			<div class="flex gap-4">
				<input type="submit" class="btn btn-blue text-white" value="Send Authentication Link" />
				<button class="btn btn-gray"><a href="/">Cancel</a></button>
			</div>
		</form>

		{#if data.canSso.github || data.canSso.google || data.canSso.facebook || data.canSso.twitter}
			<h2 class="text-2xl">{t('login.sso.title')}</h2>

			<div class="flex flex-col gap-4 mt-4 self-center">
				{#if data.canSso.google}
					<button class="btn btn-gray" on:click={() => signIn('google')}>
						<IconGoogle class="text-[#db4437] mr-2" />{t('login.cta.signInWith', {
							provider: 'Google'
						})}
					</button>
				{/if}
				{#if data.canSso.facebook}
					<button class="btn btn-gray" on:click={() => signIn('facebook')}>
						<IconFacebook class="text-[#4267B2] mr-2" />
						{t('login.cta.signInWith', { provider: 'Facebook' })}
					</button>
				{/if}
				{#if data.canSso.twitter}
					<button class="btn btn-gray" on:click={() => signIn('twitter')}>
						<IconTwitter class="text-[#1DA1F2] mr-2" />
						{t('login.cta.signInWith', { provider: 'Twitter' })}
					</button>
				{/if}
				{#if data.canSso.github}
					<button class="btn btn-gray" on:click={() => signIn('github')}>
						<IconGithub class="mr-2" />
						{t('login.cta.signInWith', { provider: 'Github' })}
					</button>
				{/if}
			</div>
		{/if}
	{/if}
</div>
