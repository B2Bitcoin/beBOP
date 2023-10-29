<script lang="ts">
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import IconSave from '~icons/ant-design/save-outlined';
	import IconDelete from '~icons/ant-design/delete-outlined';
	import { POS_ROLE_ID, SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
	import { applyAction, enhance } from '$app/forms';
	import { MultiSelect } from 'svelte-multiselect';
	import { defaultRoleOptions } from '$lib/types/Role';

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

<a href="/admin/arm/role/new" class="underline">Create a role</a>

<ul class="grid grid-cols-[auto_auto_auto_auto_auto_min-content_min-content] gap-2">
	<li class="contents">
		<span>Role ID</span>
		<span>Role name</span>
		<span>Write access</span>
		<span>Read access</span>
		<span>Forbidden access</span>
		<span>Save</span>
		<span>Delete</span>
	</li>
	{#each data.roles as role}
		<li class="contents">
			<form
				class="contents"
				method="post"
				action="/admin/arm/role/{role._id}?/update"
				use:enhance={({ action }) => {
					return async ({ result }) => {
						if (result.type === 'error') {
							return await applyAction(result);
						}

						if (action.searchParams.has('/update')) {
							successMessage = 'Role updated: ' + role._id;
							blurActiveElement();
						} else {
							await applyAction(result);
						}
					};
				}}
			>
				<input type="text" name="id" class="form-input" disabled value={role._id} />
				<input
					type="text"
					name="name"
					class="form-input"
					disabled={role._id === SUPER_ADMIN_ROLE_ID}
					value={role.name}
				/>
				<MultiSelect
					name="write"
					selected={role.permissions.write}
					options={defaultRoleOptions}
					disabled={role._id === SUPER_ADMIN_ROLE_ID}
					allowUserOptions
				/>
				<MultiSelect
					name="read"
					selected={role.permissions.read}
					options={defaultRoleOptions}
					disabled={role._id === SUPER_ADMIN_ROLE_ID}
					allowUserOptions
				/>
				<MultiSelect
					name="forbidden"
					selected={role.permissions.forbidden}
					options={defaultRoleOptions}
					allowUserOptions
					disabled={role._id === SUPER_ADMIN_ROLE_ID}
				/>
				<button
					type="submit"
					class="btn btn-black self-start"
					disabled={role._id === SUPER_ADMIN_ROLE_ID}
					title="Save"
				>
					<IconSave />
				</button>
				<button
					type="submit"
					class="btn btn-red self-start"
					formaction="/admin/arm/role/{role._id}?/delete"
					disabled={role._id === SUPER_ADMIN_ROLE_ID || role._id === POS_ROLE_ID}
					title="Delete role"
					on:click={(e) => {
						if (!confirm(`Are you sure you want to delete this role: ${role._id}?`)) {
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

<h2 class="text-2xl">Users</h2>

<a href="/admin/arm/user/new" class="underline">Create a user</a>

<ul class="grid grid-cols-[auto_auto_auto_auto_auto_min-content_min-content_min-content] gap-2">
	<li class="contents">
		<span>Login</span>
		<span>Recovery Email</span>
		<span>Recovery Npub</span>
		<span>Role</span>
		<span>Status</span>
		<span>Save</span>
		<span>Password</span>
		<span>Delete</span>
	</li>
	{#each data.users as user}
		<li class="contents">
			<form
				action="/admin/arm/user/{user._id}?/update"
				method="post"
				class="contents"
				use:enhance={({ action }) => {
					return async ({ result }) => {
						if (result.type === 'error') {
							return await applyAction(result);
						}

						if (action.searchParams.has('/resetPassword')) {
							successMessage =
								'Password reset for ' +
								user.login +
								', link to set new password sent to recovery address';
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
