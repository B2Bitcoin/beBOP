<script lang="ts">
	import MultiSelect from 'svelte-multiselect';

	const options = [
		'/admin/*',
		'/admin/layout/*',
		'/admin/config/*',
		'/admin/product/*',
		'/admin/picture/*',
		'/admin/bitcoin/*',
		'/admin/lightning/*',
		'/admin/order/*',
		'/admin/nostr/*',
		'/admin/email/*',
		'/admin/cms/*',
		'/admin/challenge/*',
		'/admin/discount/*',
		'/admin/arm/*',
		'/admin/backup/*',
		'/admin/tags/*'
	];
</script>

<h1 class="text-3xl">Create an admin role</h1>

<form method="post" class="flex flex-col gap-6">
	<label class="form-label">
		Role ID
		<input class="form-input" type="text" name="id" placeholder="role-id" required />
	</label>
	<label class="form-label">
		Role name
		<input class="form-input" type="text" name="name" required placeholder="Role name" />
	</label>

	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="form-label">
		Read/Write access
		<MultiSelect {options} allowUserOptions name="write" />
	</label>

	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="form-label">
		Read access
		<MultiSelect {options} allowUserOptions name="read" />
	</label>

	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="form-label">
		Forbidden access
		<MultiSelect {options} allowUserOptions name="forbidden" />
	</label>

	<input type="submit" value="Create" class="btn btn-black self-start" />
</form>
