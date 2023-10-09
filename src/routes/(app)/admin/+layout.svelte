<script lang="ts">
	import { navigating, page } from '$app/stores';
	import IconMenu from '~icons/ant-design/menu-outlined';
	import { slide } from 'svelte/transition';

	let navMenuOpen = false;
	const adminLinks = [
		{
			href: '/admin/layout',
			label: 'Layout'
		},
		{
			href: '/admin/config',
			label: 'Config'
		},
		{
			href: '/admin/product',
			label: 'Products'
		},
		{
			href: '/admin/picture',
			label: 'Pictures'
		},
		{
			href: '/admin/bitcoin',
			label: 'Bitcoin node'
		},
		{
			href: '/admin/lightning',
			label: 'Lightning node'
		},
		{
			href: '/admin/order',
			label: 'Orders'
		},
		{
			href: '/admin/nostr',
			label: 'NostR'
		},
		{
			href: '/admin/email',
			label: 'Emails'
		},
		{
			href: '/admin/cms',
			label: 'CMS'
		},
		{
			href: '/admin/challenge',
			label: 'Challenges'
		},
		{
			href: '/admin/discount',
			label: 'Discount'
		}
	];
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
			<span class="font-bold text-xl"
				>Admin {$page.url.pathname.startsWith('/admin/login') ? 'login' : ''}</span
			>
			{#if !$page.url.pathname.startsWith('/admin/login')}
				{#each adminLinks as link}
					<a
						href={link.href}
						class="{$page.url.pathname.startsWith(link.href) ? 'underline' : ''} hidden sm:inline"
						>{link.label}</a
					>
				{/each}
			{/if}
		</nav>
	</div>
</header>
{#if navMenuOpen && !$page.url.pathname.startsWith('/admin/login')}
	<nav
		transition:slide
		class="bg-gray-400 text-gray-800 font-light flex flex-col sm:hidden border-x-0 border-b-0 border-opacity-25 border-t-1 border-white px-4 pb-3"
	>
		{#each adminLinks as link}
			<a href={link.href} class={$page.url.pathname.startsWith(link.href) ? 'underline' : ''}
				>{link.label}</a
			>
		{/each}
	</nav>
{/if}

<main class="p-4 flex flex-col gap-4">
	<slot />
</main>
