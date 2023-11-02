<script lang="ts">
	import { navigating, page } from '$app/stores';
	import IconMenu from '~icons/ant-design/menu-outlined';
	import IconLogout from '~icons/ant-design/logout-outlined';
	import { slide } from 'svelte/transition';
	import { isAllowedOnPage } from '$lib/types/Role';
	import { POS_ROLE_ID } from '$lib/types/User';
	import {
		adminLinks,
		configLinks,
		merchLinks,
		nodeManagementLinks,
		transactionLinks
	} from './adminLinks.js';

	export let data;

	let navMenuOpen = false;

	$: if ($navigating) {
		navMenuOpen = false;
	}

	$: isLoginPage = /^\/admin(-[0-9a-zA-Z]+)?\/login/.test($page.url.pathname);
</script>

{#if !isLoginPage}
	<header class="bg-gray-400 text-gray-800 py-2 items-center flex">
		<div class="mx-auto max-w-7xl flex gap-3 px-6 grow flex-col flex-wrap">
			<nav class="flex gap-6 font-light sm:hidden items-center">
				<button
					class="inline-flex flex-col justify-center sm:hidden cursor-pointer text-2xl transition"
					class:rotate-90={navMenuOpen}
					on:click={() => (navMenuOpen = !navMenuOpen)}
				>
					<IconMenu />
				</button>
				<span class="font-bold text-xl flex items-center gap-2">
					<a class="hover:underline" href="/admin">Admin</a>
					<form action="/admin/logout" method="post" class="contents">
						<button type="submit">
							<span class="sr-only">Log out</span>
							<IconLogout class="text-red-500" />
						</button>
					</form>
				</span>
			</nav>
			<div class="hidden sm:inline">
				<nav class="flex gap-6 font-light items-center">
					<span class="font-bold text-xl flex items-center gap-2">
						<a class="hover:underline" href="/admin">Merch</a>
						<form action="/admin/logout" method="post" class="contents">
							<button type="submit">
								<span class="sr-only">Log out</span>
								<IconLogout class="text-red-500" />
							</button>
						</form>
					</span>
					{#each merchLinks.filter( (l) => (data.role ? isAllowedOnPage(data.role, l.href, 'read') : true) ) as link}
						<a
							href={link.href}
							data-sveltekit-preload-data="off"
							class="{$page.url.pathname.startsWith(link.href) ? 'underline' : ''} "
							class:italic={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
							class:opacity-70={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
						>
							{link.label}
						</a>
					{/each}
					{#if data.roleId === POS_ROLE_ID}
						<a
							href="/pos"
							data-sveltekit-preload-data="off"
							class="{$page.url.pathname.startsWith('/pos')
								? 'underline'
								: ''} hidden sm:inline font-bold text-green-600"
						>
							POS session
						</a>
					{/if}
				</nav>
				<nav class="flex gap-6 font-light items-center">
					<span class="font-bold text-xl flex items-center gap-2">
						<a class="hover:underline" href="/admin">Config</a>
					</span>
					{#each configLinks.filter( (l) => (data.role ? isAllowedOnPage(data.role, l.href, 'read') : true) ) as link}
						<a
							href={link.href}
							data-sveltekit-preload-data="off"
							class={$page.url.pathname.startsWith(link.href) ? 'underline' : ''}
							class:italic={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
							class:opacity-70={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
						>
							{link.label}
						</a>
					{/each}
				</nav>
				<nav class="flex gap-6 font-light items-center">
					<span class="font-bold text-xl flex items-center gap-2">
						<a class="hover:underline" href="/admin">Node Management</a>
					</span>
					{#each nodeManagementLinks.filter( (l) => (data.role ? isAllowedOnPage(data.role, l.href, 'read') : true) ) as link}
						<a
							href={link.href}
							data-sveltekit-preload-data="off"
							class="{$page.url.pathname.startsWith(link.href) ? 'underline' : ''} "
							class:italic={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
							class:opacity-70={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
						>
							{link.label}
						</a>
					{/each}
				</nav>
				<nav class="flex gap-6 font-light items-center">
					<span class="font-bold text-xl flex items-center gap-2">
						<a class="hover:underline" href="/admin">Transaction</a>
					</span>
					{#each transactionLinks.filter( (l) => (data.role ? isAllowedOnPage(data.role, l.href, 'read') : true) ) as link}
						<a
							href={link.href}
							data-sveltekit-preload-data="off"
							class={$page.url.pathname.startsWith(link.href) ? 'underline' : ''}
							class:italic={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
							class:opacity-70={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
						>
							{link.label}
						</a>
					{/each}
				</nav>
			</div>
		</div>
	</header>
{/if}
{#if navMenuOpen && !isLoginPage}
	<nav
		transition:slide
		class="bg-gray-400 text-gray-800 font-light flex flex-col sm:hidden border-x-0 border-b-0 border-opacity-25 border-t-1 border-white px-4 pb-3"
	>
		{#each adminLinks as link}
			<a
				href={link.href}
				class={$page.url.pathname.startsWith(link.href) ? 'underline' : ''}
				data-sveltekit-preload-data="off"
				class:italic={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
				class:opacity-70={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
			>
				{link.label}
			</a>
		{/each}
		{#if data.roleId === POS_ROLE_ID}
			<a
				href="/pos"
				data-sveltekit-preload-data="off"
				class="{$page.url.pathname.startsWith('/pos')
					? 'underline'
					: ''} hidden sm:inline font-bold text-green-600"
			>
				POS session
			</a>
		{/if}
	</nav>
{/if}

<main class="p-4 flex flex-col gap-4">
	<slot />
</main>
