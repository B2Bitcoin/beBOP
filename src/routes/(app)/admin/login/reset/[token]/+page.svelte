<script lang="ts">
	import IconStandBy from '$lib/components/icons/IconStandBy.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;
	export let data;

	let pwd1: string;
	let pwd2: string;
	let formPass: HTMLFormElement;

	let failedMatch = false;
	function handleSubmit(event: Event) {
		event.preventDefault();
		if (pwd1 !== pwd2) {
			failedMatch = true;
		} else {
			failedMatch = false;
			formPass.submit();
		}
	}
</script>

<h1 class="text-2xl">Password reset</h1>
<div class="flex justify-center items-center {form?.success ? 'hidden sm-inline' : ''}">
	<form
		method="post"
		class="flex-col gap-2 space-between p-6 w-[30em]"
		on:submit={handleSubmit}
		bind:this={formPass}
	>
		<div class="flex justify-center mb-2">
			<IconStandBy class="text-green-500" />
		</div>
		<label class="form-label mb-1">
			<input
				class="form-input"
				type="text"
				name="login"
				placeholder="Enter other admin login"
				value={data.user?.login}
				disabled
			/>
			<input class="form-input" type="hidden" name="idUser" value={data.user?._id} />
		</label>
		<label class="form-label mb-1">
			<input
				class="form-input {failedMatch ? 'bg-red-500' : ''}"
				type="password"
				name="pwd1"
				placeholder="Enter new password"
				bind:value={pwd1}
			/>
		</label>
		<label class="form-label">
			<input
				class="form-input {failedMatch ? 'bg-red-500' : ''}"
				type="password"
				name="pwd2"
				placeholder="Enter confirmation password"
				bind:value={pwd2}
			/>
		</label>
		<div class="flex-wrap text-center">
			{#if form?.failed}
				<p class="text-red-500">Invalid credentials, please try again</p>
			{/if}
			{#if failedMatch}
				<p class="text-red-500">passwords do not match</p>
			{/if}
		</div>
		<div class="flex justify-center gap-4 mt-2">
			<input type="submit" class="btn btn-blue text-white" value="Update" />
		</div>
	</form>
</div>

<div class="flex-col justify-center items-center {!form?.success ? 'hidden sm-inline' : ''}">
	<div class="flex justify-center mb-2">
		<IconStandBy class="text-green-500" />
	</div>
	<div class="flex-wrap text-center">
		<p class="text-green-500">Your credential were resetted.</p>
	</div>
	<div class="flex justify-center gap-4 mt-2">
		<button class="btn btn-blue"><a href="/admin/login">Go to login</a></button>
	</div>
</div>
