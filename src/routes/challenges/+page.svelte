<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>challenge</title>
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border py-3 px-3">
		<div class=" w-12 min-w-[400px] py-12">
			{#each data.challenge as chal, i}
				<a href={'challenges/' + chal._id}>
					{chal.name}
				</a>
			{/each}
		</div>
	</article>
</main>
