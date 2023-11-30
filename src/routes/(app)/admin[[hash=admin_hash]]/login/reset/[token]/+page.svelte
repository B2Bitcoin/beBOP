<script lang="ts">
	import IconStandBy from '$lib/components/icons/IconStandBy.svelte';
	import { useI18n } from '$lib/i18n';

	export let data;

	let password: string;
	let formElement: HTMLFormElement;
	let errorMessage = '';

	const { t, locale } = useI18n();

	async function handleSubmit(event: Event) {
		event.preventDefault();
		errorMessage = '';

		const sha1 = crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
		const sha1Hex = Array.from(new Uint8Array(await sha1))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')
			.toUpperCase();

		const pwnedPasswordResp = await fetch(
			`https://api.pwnedpasswords.com/range/${sha1Hex.slice(0, 5)}`
		);
		let pwnedTimes = 0;
		if (pwnedPasswordResp.ok) {
			const pwnedPasswords = await pwnedPasswordResp.text().then((r) => r.split('\n'));
			const pwnedPassword = pwnedPasswords.find((line) => line.startsWith(sha1Hex.slice(5)));

			if (pwnedPassword) {
				pwnedTimes = parseInt(pwnedPassword.split(':')[1]);
			}
		}
		if (pwnedTimes) {
			errorMessage = t('login.password.pwned', {
				count: pwnedTimes.toLocaleString($locale)
			});
		} else {
			formElement?.submit();
		}
	}
</script>

<h1 class="text-2xl text-center">Password reset</h1>

<div class="flex justify-center">
	<IconStandBy class="text-green-500" />
</div>

<form
	method="post"
	class="flex flex-col mx-auto gap-4 max-w-xl"
	on:submit={handleSubmit}
	bind:this={formElement}
>
	<label class="form-label mb-1 max-w-sm mx-auto">
		<input
			class="form-input"
			type="text"
			name="login"
			placeholder="Enter other admin login"
			value={data.user?.login}
			disabled
		/>
		<input class="form-input" type="hidden" name="userId" value={data.user?._id} />
	</label>
	<label class="form-label mb-1 max-w-sm mx-auto">
		<input
			class="form-input"
			type="password"
			name="password"
			placeholder="Enter new password"
			minlength="8"
			bind:value={password}
		/>
	</label>
	<div class="flex-wrap text-center">
		{#if errorMessage}
			<p class="text-red-500">{errorMessage}</p>
		{/if}
	</div>
	<input type="submit" class="btn btn-blue text-white self-center" value="Update" />
</form>
