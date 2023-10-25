<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">{data.user.login}</h1>

<a href="/admin/pos/{data.user._id}/edit">Modifier le POS</a>
<a target="_blank" href="/admin/pos/session">Ouvrir la session</a>
