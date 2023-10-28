<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Access Rights Management</h1>

<h2 class="text-2xl">Roles</h2>

<ul class="flex flex-col flex-wrap gap-2 list-disc ml-4">
	{#each data.roles as role}
		<li>{role.name} [{role._id}]</li>
	{/each}
</ul>

<h2 class="text-2xl">Users</h2>

<a href="/admin/arm/user/new" class="underline">Create a user</a>

<ul class="flex flex-col flex-wrap gap-2 list-disc ml-4">
	{#each data.users as user}
		<li><a href="/admin/arm/user/{user._id}" class="underline">{user.login}</a> [{user.role}]</li>
	{/each}
</ul>
