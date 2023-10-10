<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<h1 class="text-2xl">Link Authentification</h1>

<div class="flex justify-center items-center">
	<form method="post" class="flex-col gap-4 p-6 w-[30em]">
		<label class="form-label">
			Login (email, nostr or phone)
			<input class="form-input" type="text" name="login" placeholder="Enter the address" required />
		</label>
		<div class="flex-wrap text-center">
			{#if form?.success}
				<p class="text-green-500">An authentification request link was sent</p>
				<p class="text-green-500">to your given address.</p>
			{/if}
			{#if form?.fail}
				<p class="text-red-500">Sorry, you authentification request link failed.</p>
			{/if}
		</div>
		<div class="flex justify-center gap-4 mt-2">
			<input type="submit" class="btn btn-blue text-white" value="Login" />
			<button class="btn btn-gray"><a href="/">Cancel</a></button>
		</div>
	</form>
</div>
