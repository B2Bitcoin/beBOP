<script>
	import '../app.css';
	import '@fontsource/outfit/700.css';
	import '@fontsource/outfit/600.css';
	import '@fontsource/outfit/400.css';
	import '@fontsource/outfit/300.css';
</script>

<svelte:head>
	<title>B2Bitcoin Bootik</title>
	<meta name="description" content="B2Bitcoin's official bootik" />
</svelte:head>

<header class="bg-gray-850 items-center flex h-[100px]">
	<div class="mx-auto max-w-5xl flex items-center gap-6 px-6 text-white grow">
		<div class="flex items-center gap-4">
			<img
				class="h-[60px] w-[60px] rounded-full"
				src="https://coyo.dev/icons/logo.png"
				alt="Main logo"
			/>
			<span class="font-bold text-[32px]">Samdoesart</span>
		</div>
		<span class="grow" />
		<nav class="flex gap-10 text-[22px] font-semibold">
			<a href="/blog">Blog</a>
			<a href="/store">Store</a>
			<a href="/mecenas">Mecenas</a>
		</nav>
		<div class="border-r-[1px] border-gray-700 h-8 border-solid" />
		<a href="/connect" class="btn btn-blue font-bold">Connect your wallet</a>
	</div>
</header>
<main class="grow">
	<slot />
</main>
<footer class="bg-gray-850 h-[90px] items-center flex">
	<div class="mx-auto max-w-5xl px-6 flex items-center gap-2 text-gray-550 grow">
		<span class="font-thin">Power by</span><span class="font-display text-xl text-white">
			LaBookinerie.
		</span>
	</div>
</footer>
