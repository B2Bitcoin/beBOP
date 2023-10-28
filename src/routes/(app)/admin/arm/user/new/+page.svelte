<script lang="ts">
	import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';

	export let data;
</script>

<h1 class="text-3xl">Create a user</h1>

<form method="post" class="flex flex-col gap-6">
	<label class="form-label">
		Role
		<select class="form-input" name="role" required>
			{#each data.roles as role}
				<option value={role._id} disabled={role._id === SUPER_ADMIN_ROLE_ID}>{role.name}</option>
			{/each}
		</select>
	</label>
	<label class="form-label">
		Login
		<input class="form-input" type="text" name="login" required />
	</label>
	<label class="form-label">
		Password
		<input class="form-input" type="password" name="password" required />
	</label>
	<input type="submit" value="Create" class="btn btn-black self-start" />
</form>
