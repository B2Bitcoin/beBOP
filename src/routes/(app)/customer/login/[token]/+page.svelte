<script lang="ts">
	import IconStandBy from '$lib/components/icons/IconStandBy.svelte';
	export let data;
</script>

<h1 class="text-2xl">Link Authentification</h1>

<div class="flex-col justify-center items-center }">
	<div class="flex justify-center mb-2">
		<IconStandBy class="text-green-500" />
	</div>
	<div class="flex-wrap text-center">
		<p class="text-green-500">Successfully logged in with {data.login}</p>
	</div>
	<div class="flex justify-center gap-4 mt-2">
		<button class="btn btn-blue"><a href="/">Go to home</a></button>
	</div>
</div>
