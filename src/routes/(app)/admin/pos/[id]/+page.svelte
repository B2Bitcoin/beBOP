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
{#if data?.sessions[0]?.sessionId}
	<a target="_blank" href={`/session/${data?.sessions[0]?.sessionId}`}>Ouvrir la session active</a>
{/if}

<h2 class="text-2xl">Active sessions :</h2>
<div class="flex flex-col flex-wrap gap-2">
	{#each data.sessions as session}
		<a href="/admin/pos/session/{session?.sessionId}">{session?.sessionId}</a>
	{/each}
</div>
