<script lang="ts">
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import IconSave from '~icons/ant-design/save-outlined';
	import IconDelete from '~icons/ant-design/delete-outlined';
	import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
	import { applyAction, enhance } from '$app/forms';

	export let data;

	function blurActiveElement() {
		if (document.activeElement?.tagName === 'INPUT') {
			(document.activeElement as HTMLInputElement).blur();
		}
	}

	let successMessage = '';
</script>

<h1 class="text-3xl">Access Rights Management</h1>

{#if successMessage}
	<div class="alert alert-success">{successMessage}</div>
{/if}

<h2 class="text-2xl">Roles</h2>

<ul class="flex flex-col flex-wrap gap-2 list-disc ml-4">
	{#each data.roles as role}
		<li>{role.name} [{role._id}]</li>
	{/each}
</ul>

<h2 class="text-2xl">Users</h2>

<a href="/admin/arm/user/new" class="underline">Create a user</a>

<ul class="flex flex-col flex-wrap gap-2">
	{#each data.users as user}
		<li>
			<form
				action="/admin/arm/user/{user._id}?/update"
				method="post"
				class="flex gap-2"
				use:enhance={({ action }) => {
					return async ({ result }) => {
						if (result.type === 'error') {
							return await applyAction(result);
						}

						if (action.searchParams.has('/resetPassword')) {
							successMessage = 'Password reset for ' + user.login;
						} else if (action.searchParams.has('/update')) {
							successMessage = 'Account updated: ' + user.login;
							blurActiveElement();
						} else {
							await applyAction(result);
						}
					};
				}}
			>
				<input
					type="text"
					name="login"
					class="form-input"
					value={user.login}
					disabled={user.roleId === SUPER_ADMIN_ROLE_ID}
				/>
				<input
					type="email"
					name="recoveryEmail"
					class="form-input"
					disabled={user.roleId === SUPER_ADMIN_ROLE_ID}
					value={user.recovery?.email ?? ''}
				/>
				<input
					type="text"
					name="recoveryPassword"
					class="form-input"
					disabled={user.roleId === SUPER_ADMIN_ROLE_ID}
					value={user.recovery?.npub ?? ''}
				/>
				<select class="form-input" disabled={user.roleId === SUPER_ADMIN_ROLE_ID} name="roleId">
					{#each data.roles as role}
						<option
							value={role._id}
							selected={role._id === user.roleId}
							disabled={role._id === SUPER_ADMIN_ROLE_ID}
						>
							{role.name}
						</option>
					{/each}
				</select>
				<select class="form-input" disabled={user.roleId === SUPER_ADMIN_ROLE_ID} name="status">
					<option value="enabled" selected={!user.disabled}>Enabled</option>
					<option value="disabled" selected={!!user.disabled}>Disabled</option>
				</select>
				<button
					type="submit"
					class="btn btn-black self-start"
					disabled={user.roleId === SUPER_ADMIN_ROLE_ID}
					title="Save"
				>
					<IconSave />
				</button>
				<button
					type="submit"
					class="btn btn-red self-start"
					formaction="/admin/arm/user/{user._id}?/resetPassword"
					disabled={user.roleId === SUPER_ADMIN_ROLE_ID}
					title="Reset password"
				>
					<IconRefresh />
				</button>
				<button
					type="submit"
					class="btn btn-red self-start"
					formaction="/admin/arm/user/{user._id}?/delete"
					disabled={user.roleId === SUPER_ADMIN_ROLE_ID}
					title="Delete account"
					on:click={(e) => {
						if (!confirm(`Are you sure you want to delete this account: ${user.login}?`)) {
							e.preventDefault();
						}
					}}
				>
					<IconDelete />
				</button>
			</form>
		</li>
	{/each}
</ul>
