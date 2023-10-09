<script>
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<div
		class="w-full rounded-xl bg-white border-gray-300 border p-6 grid flex md:grid-cols-3 sm:flex-wrap gap-2"
	>
		<h1>SvelteKit Auth Example</h1>
		<p>
			{#if $page.data.sessionSvelteKit}
				{#if $page.data.sessionSvelteKit.user?.image}
					<span
						style="background-image: url('{$page.data.sessionSvelteKit.user.image}')"
						class="avatar"
					/>
				{/if}
				<span class="signedInText">
					<small>Signed in as</small><br />
					<strong>{$page.data.sessionSvelteKit.user?.name ?? 'User'}</strong>
				</span>
				<button on:click={() => signOut()} class="button">Sign out</button>
			{:else}
				<span class="notSignedInText">You are not signed in</span>
				<button on:click={() => signIn('github')}>Sign In with GitHub</button>
			{/if}
		</p>
	</div>
</main>
