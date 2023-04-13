<script>
	import '../app.css';
  import '@fontsource/outfit/400.css';
	import '@fontsource/outfit/300.css';
</script>

<svelte:head>
	<title>B2Bitcoin Bootik</title>
	<meta
		name="description"
		content="B2Bitcoin's official bootik"
	/>
</svelte:head>

<header class="bg-gray-850 items-center flex h-[100px]">
  <div class="mx-auto max-w-3xl flex items-center gap-2 text-gray-50 grow">
    <img class="h-12 w-12 rounded-full" src="https://coyo.dev/icons/logo.png" alt="Main logo" />
    Samdoesart
  </div>
</header>
<main class="grow">
  <slot />
</main>
<footer class="bg-gray-850 h-[90px] items-center flex">
  <span>Powered by <span class="display-header">LaBookinerie</span></span>
</footer>
