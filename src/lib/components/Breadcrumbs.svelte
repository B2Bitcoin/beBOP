<script lang="ts">
	export let links: { name: string; url: string }[] = [];
</script>

<nav class="flex gap-2 text-gray-700 font-light">
	{#each links as link, i}
		{#if i}
			&gt;
		{/if}
		<a href={link.url} class="hover:underline {i === links.length - 1 ? 'font-semibold' : ''}"
			>{link.name}</a
		>
	{/each}
</nav>
