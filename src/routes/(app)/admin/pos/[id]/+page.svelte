<script lang="ts">
	export let data;

	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this product?')) {
			event.preventDefault();
		}
	}
</script>

<div>
	{data.seat.login}
</div>

<form method="post" class="flex flex-col gap-4" action="?/update">
	<label class="form-label">
		Login
		<input
			class="form-input"
			type="text"
			name="login"
			value={data.seat.login}
			placeholder="Enter your login"
			required
		/>
	</label>
	<label class="form-label">
		Password
		<input class="form-input" type="password" name="password" placeholder="Enter your password" />
	</label>
	<div class="flex gap-2">
		<button type="submit" class="btn btn-red" formaction="?/delete" on:click={confirmDelete}>
			Delete
		</button>
		<button type="submit" class="btn btn-blue">Update</button>
	</div>
</form>
