<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<nav class="flex gap-2 text-gray-700 font-light">
		<a href="/" class="hover:underline">Home</a>
		&gt;
		<a href="/resource" class="hover:underline">Resources</a>
		&gt;
		<a href={$page.url.pathname} class="hover:underline font-semibold">{data.product.name}</a>
	</nav>
</main>
