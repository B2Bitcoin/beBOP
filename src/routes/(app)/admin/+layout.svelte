<script lang="ts">
	import { navigating, page } from '$app/stores';
	import IconMenu from '~icons/ant-design/menu-outlined';
	import { slide } from 'svelte/transition';

	let navMenuOpen = false;

	$: if ($navigating) {
		navMenuOpen = false;
	}
</script>

<header class="bg-gray-400 text-gray-800 py-2 items-center flex">
	<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 grow overflow-hidden">
		<nav class="flex gap-6 font-light items-center">
			<button
				class="inline-flex flex-col justify-center sm:hidden cursor-pointer text-2xl transition"
				class:rotate-90={navMenuOpen}
				on:click={() => (navMenuOpen = !navMenuOpen)}
			>
				<IconMenu />
			</button>
			<span class="font-bold text-xl">Admin</span>

			<a
				href="/admin/layout"
				class="{$page.url.pathname.startsWith('/admin/layout') ? 'underline' : ''} hidden sm:inline"
				>Layout</a
			>
			<a
				href="/admin/config"
				class="{$page.url.pathname.startsWith('/admin/config') ? 'underline' : ''} hidden sm:inline"
				>Config</a
			>
			<a
				href="/admin/product"
				class="{$page.url.pathname.startsWith('/admin/product')
					? 'underline'
					: ''} hidden sm:inline">Products</a
			>
			<a
				href="/admin/picture"
				class="{$page.url.pathname.startsWith('/admin/picture')
					? 'underline'
					: ''} hidden sm:inline">Pictures</a
			>
			<a
				href="/admin/bitcoin"
				class="{$page.url.pathname.startsWith('/admin/bitcoin')
					? 'underline'
					: ''} hidden sm:inline">Bitcoin node</a
			>
			<a
				href="/admin/lightning"
				class="{$page.url.pathname.startsWith('/admin/lightning')
					? 'underline'
					: ''} hidden sm:inline">Lightning node</a
			>
			<a
				href="/admin/order"
				class="{$page.url.pathname.startsWith('/admin/order') ? 'underline' : ''} hidden sm:inline"
				>Orders</a
			>
			<a
				href="/admin/nostr"
				class="{$page.url.pathname.startsWith('/admin/nostr') ? 'underline' : ''} hidden sm:inline"
				>NostR</a
			>
			<a
				href="/admin/email"
				class="{$page.url.pathname.startsWith('/admin/email') ? 'underline' : ''} hidden sm:inline"
				>Emails</a
			>
			<a
				href="/admin/cms"
				class="{$page.url.pathname.startsWith('/admin/cms') ? 'underline' : ''} hidden sm:inline"
				>CMS</a
			>
			<a
				href="/admin/challenge"
				class="{$page.url.pathname.startsWith('/admin/challenge')
					? 'underline'
					: ''} hidden sm:inline">Challenges</a
			>
		</nav>
	</div>
</header>
{#if navMenuOpen}
	<nav
		transition:slide
		class="bg-gray-400 text-gray-800 font-light flex flex-col sm:hidden border-x-0 border-b-0 border-opacity-25 border-t-1 border-white px-4 pb-3"
	>
		<a
			href="/admin/layout"
			class={$page.url.pathname.startsWith('/admin/layout') ? 'underline' : ''}>Layout</a
		>
		<a
			href="/admin/config"
			class={$page.url.pathname.startsWith('/admin/config') ? 'underline' : ''}>Config</a
		>
		<a
			href="/admin/product"
			class={$page.url.pathname.startsWith('/admin/product') ? 'underline' : ''}>Products</a
		>
		<a
			href="/admin/picture"
			class={$page.url.pathname.startsWith('/admin/picture') ? 'underline' : ''}>Pictures</a
		>
		<a
			href="/admin/bitcoin"
			class={$page.url.pathname.startsWith('/admin/bitcoin') ? 'underline' : ''}>Bitcoin node</a
		>
		<a
			href="/admin/lightning"
			class={$page.url.pathname.startsWith('/admin/lightning') ? 'underline' : ''}>Lightning node</a
		>
		<a href="/admin/order" class={$page.url.pathname.startsWith('/admin/order') ? 'underline' : ''}
			>Orders</a
		>
		<a href="/admin/nostr" class={$page.url.pathname.startsWith('/admin/nostr') ? 'underline' : ''}
			>NostR</a
		>
		<a href="/admin/email" class={$page.url.pathname.startsWith('/admin/email') ? 'underline' : ''}
			>Emails</a
		>
		<a href="/admin/cms" class={$page.url.pathname.startsWith('/admin/cms') ? 'underline' : ''}
			>CMS</a
		>
		<a
			href="/admin/challenge"
			class={$page.url.pathname.startsWith('/admin/challenge') ? 'underline' : ''}>Challenges</a
		>
	</nav>
{/if}

<main class="p-4 flex flex-col gap-4">
	<slot />
</main>
