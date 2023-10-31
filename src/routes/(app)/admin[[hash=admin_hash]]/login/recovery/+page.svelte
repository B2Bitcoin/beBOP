<script lang="ts">
	import IconStandBy from '$lib/components/icons/IconStandBy.svelte';
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<h1 class="text-2xl">Password recovery</h1>
<div class="flex justify-center items-center">
	<form method="post" class="flex-col gap-4 p-6 w-[30em]">
		<div class="flex justify-center">
			<IconStandBy class="text-red-500" />
		</div>
		<label class="form-label">
			<input
				class="form-input"
				type="text"
				name="login"
				value={form?.login ?? ''}
				placeholder="Enter other admin login"
			/>
		</label>
		<div class="flex-wrap text-center">
			{#if !form?.success}
				<p>A password reset email will be send</p>
				<p>to shop backup email.</p>
			{/if}
			{#if form?.success}
				<p class="text-green-500">A password email was sent.</p>
				<p class="text-green-500">to shop backup address.</p>
			{/if}
			{#if form?.failedFindUser}
				<p class="text-red-500">No user with this information.</p>
			{/if}
		</div>
		<div class="flex justify-center gap-4 mt-2">
			<input type="submit" class="btn btn-red text-white" value="Reset" />
		</div>
	</form>
</div>
