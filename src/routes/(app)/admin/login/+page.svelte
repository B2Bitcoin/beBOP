<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
	let rememberOption = false;
	const rememberDates = [
		{
			option: '1 hour',
			value: 3600
		},
		{
			option: '1 day',
			value: 86400
		},
		{
			option: '1 week',
			value: 86400 * 7
		},
		{
			option: '1 month',
			value: 86400 * 30
		},
		{
			option: 'As much as possible',
			value: 1
		}
	];
</script>

<div class="flex justify-center items-center">
	<form method="post" class="flex-col gap-4 p-6 w-[30em]">
		<label class="form-label">
			Login
			<input
				class="form-input {form?.incorrect ? 'bg-red-300' : ''}"
				type="text"
				name="login"
				placeholder="Enter your login"
				value={form?.login ?? ''}
				required
			/>
		</label>
		<label class="form-label">
			Password
			<input
				class="form-input {form?.incorrect ? 'bg-red-300' : ''}"
				type="password"
				name="password"
				placeholder="Enter your password"
				required
			/>
		</label>
		<div class="flex flex-row gap-4 mt-2 justify-between">
			<label class="checkbox-label">
				<input
					class="form-checkbox"
					type="checkbox"
					name="remember"
					bind:checked={rememberOption}
				/>
				Remember me
			</label>
			<select
				name="memorize"
				class="form-input w-[15em] {rememberOption ? '' : 'hidden sm-inline'}"
			>
				{#each rememberDates as rememberDate}
					<option value={rememberDate.value}>{rememberDate.option} </option>
				{/each}
			</select>
		</div>
		{#if form?.incorrect}
			<p class="text-red-500"><b>Invalid credentials, please try again</b></p>
		{/if}
		{#if 0}
			<p class="text-red-500"><b>Something went wrong.</b></p>
			<p class="text-red-500"><b>Please try again or ask superadmin to check error log.</b></p>
		{/if}
		{#if 0}
			<p class="text-red-500"><b>This account is enabled.</b></p>
			<p class="text-red-500"><b>Please contact superadmin.</b></p>
		{/if}
		<div class="flex justify-center gap-4 mt-2">
			<input type="submit" class="btn btn-blue text-white" value="Login" />
			<input type="reset" class="btn btn-gray" value="Recovery" />
		</div>
	</form>
</div>
