<script lang="ts">
</script>

<form method="post" class="flex flex-col gap-6">
	<label class="form-label">
		Login
		<input class="form-input" type="text" name="login" placeholder="Enter your login" required />
	</label>
	<label class="form-label">
		Password
		<input
			class="form-input"
			type="password"
			name="password"
			placeholder="Enter your password"
			required
		/>
	</label>
	<input type="submit" value="Create" class="btn btn-black self-start" />
</form>
