<script lang="ts">
	import { page } from '$app/stores';
	let isMenuOpen = false;

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<header class="bg-gray-400 text-gray-800 py-2 items-center flex">
	<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 grow overflow-hidden">
		<div class="-mr-2 flex md:hidden">
			<!-- Hamburger menu button -->
			<div class="burger-menu-button">
				<button
					type="button"
					class="inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
					on:click={toggleMenu}
				>
					<svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>
		</div>
		<span class="font-bold text-xl">Admin</span>
		<div class="-mr-2 flex mx:hidden">
			<nav class="flex gap-6 font-light items-center">
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
					class={$page.url.pathname.startsWith('/admin/lightning') ? 'underline' : ''}
					>Lightning node</a
				>
				<a
					href="/admin/order"
					class={$page.url.pathname.startsWith('/admin/order') ? 'underline' : ''}>Orders</a
				>
				<a
					href="/admin/nostr"
					class={$page.url.pathname.startsWith('/admin/nostr') ? 'underline' : ''}>NostR</a
				>
				<a
					href="/admin/email"
					class={$page.url.pathname.startsWith('/admin/email') ? 'underline' : ''}>Emails</a
				>
				<a href="/admin/cms" class={$page.url.pathname.startsWith('/admin/cms') ? 'underline' : ''}
					>CMS</a
				>
				<a
					href="/admin/challenge"
					class={$page.url.pathname.startsWith('/admin/challenge') ? 'underline' : ''}>Challenges</a
				>
			</nav>
		</div>
	</div>
</header>

<main class="p-4 flex flex-col gap-4">
	<slot />
</main>
