<script lang="ts">
	export let form;
</script>

<form method="post" class="flex flex-col gap-6">
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
	<input type="submit" value="Create" class="btn btn-black self-start" />
</form>
