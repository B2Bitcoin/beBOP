<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>challenge</title>
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border py-3 px-3">
		<div class=" w-12 min-w-[400px] py-12">
			<h1 class="text-3xl">List of challenge</h1>
			<br />

			<ul>
				{#each data.challenges as chal, i}
					<li>
						<a href={'challenges/' + chal._id} class="underline text-blue">
							{chal.name}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</article>
</main>
