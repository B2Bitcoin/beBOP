<script lang="ts">
	export let data;

	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this user?')) {
			event.preventDefault();
		}
	}
</script>

<h1 class="text-3xl">{data.user.login}</h1>

<a href="/admin/pos/{data.user._id}/edit">Modifier le POS</a>
<a target="_blank" href="/admin/pos/session">Ouvrir la session</a>
