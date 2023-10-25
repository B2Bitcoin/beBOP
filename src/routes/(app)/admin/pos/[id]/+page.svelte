<script lang="ts">
	import { page } from '$app/stores';
	export let data;

	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this user?')) {
			event.preventDefault();
		}
	}
</script>

<div>
	User: <b>{data.user.login}</b>
</div>

<form method="post" class="flex flex-col gap-4" action="/admin/pos/{$page.params.id}?/update">
	<label class="form-label">
		Login
		<input
			class="form-input"
			type="text"
			name="login"
			value={data.user.login}
			placeholder="Enter the username"
			required
		/>
	</label>
	<label class="form-label">
		Password
		<input class="form-input" type="password" name="password" placeholder="Enter the password" />
	</label>
	<div class="flex gap-2">
		<button
			type="submit"
			class="btn btn-red"
			formaction="/admin/pos/{$page.params.id}?/delete"
			on:click={confirmDelete}
		>
			Delete
		</button>
		<button type="submit" class="btn btn-blue">Update</button>
	</div>
</form>
