<script lang="ts">
	import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
	import { page } from '$app/stores';

	export let data;

	let npub = '';
</script>

<h1 class="text-3xl">Create a user</h1>

<form method="post" class="flex flex-col gap-6">
	<label class="form-label">
		Role
		<select class="form-input" name="roleId" required>
			{#each data.roles as role}
				<option value={role._id} disabled={role._id === SUPER_ADMIN_ROLE_ID}>{role.name}</option>
			{/each}
		</select>
	</label>
	<label class="form-label">
		Login
		<input class="form-input" type="text" name="login" placeholder="user" required />
	</label>
	<label class="form-label">
		Alias
		<input class="form-input" type="text" name="alias" placeholder="alias" />
	</label>
	<label class="form-label">
		Recovery Email
		<input
			class="form-input"
			type="email"
			name="email"
			required={!npub}
			placeholder="user@{$page.url.hostname}"
		/>
	</label>
	<label class="form-label">
		Recovery Npub
		<input
			class="form-input"
			type="npub"
			name="npub"
			bind:value={npub}
			placeholder="npub1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
		/>
	</label>
	<input type="submit" value="Create" class="btn btn-black self-start" />
</form>
