<script lang="ts">
	import { navigating, page } from '$app/stores';
	import IconMenu from '~icons/ant-design/menu-outlined';
	import IconLogout from '~icons/ant-design/logout-outlined';
	import { slide } from 'svelte/transition';
	import { isAllowedOnPage } from '$lib/types/Role';
	import { POS_ROLE_ID } from '$lib/types/User';
	import { adminLinks as adminLinksImported } from './adminLinks.js';

	export let data;

	let navMenuOpen = false;

	$: if ($navigating) {
		navMenuOpen = false;
	}

	const adminLinks = adminLinksImported.map((link) => ({
		...link,
		links: link.links.map((l) => ({
			...l,
			href: l.href.replace('/admin', data.adminPrefix)
		}))
	}));

	$: isLoginPage = /^\/admin(-[0-9a-zA-Z]+)?\/login/.test($page.url.pathname);

	let sectionName = '';
</script>

{#if !isLoginPage}
	<header class="bg-gray-400 text-gray-800 py-2 items-center flex">
		<div class="mx-auto max-w-7xl flex gap-3 px-6 grow flex-col">
			<nav class="flex gap-x-6 gap-y-2 font-light items-center">
				<button
					class="inline-flex flex-col justify-center sm:hidden cursor-pointer text-2xl transition"
					class:rotate-90={navMenuOpen}
					on:click={() => (navMenuOpen = !navMenuOpen)}
				>
					<IconMenu />
				</button>
				<span class="font-bold text-xl flex items-center gap-2">
					<a class="hover:underline" href={data.adminPrefix}>Admin</a>
					<form action="{data.adminPrefix}/logout" method="post" class="contents">
						<button type="submit">
							<span class="sr-only">Log out</span>
							<IconLogout class="text-red-500" />
						</button>
					</form>
				</span>
				{#each adminLinks as adminLink}
					<span class="text-xl hidden sm:inline">
						<a
							class="hover:underline"
							href="#{adminLink.section}"
							on:click={() => (sectionName = adminLink.section)}>{adminLink.section}</a
						>
					</span>
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
			<nav class="flex gap-x-6 items-center">
				{#each adminLinks.filter((item) => item.section === sectionName) as adminLink}
					<span class="font-bold text-xl hidden sm:inline">
						{adminLink.section}
					</span>
					{#each adminLink.links.filter( (l) => (data.role ? isAllowedOnPage(data.role, l.href, 'read') : true) ) as link}
						<a
							href={link.href}
							data-sveltekit-preload-data="off"
							class="{$page.url.pathname.startsWith(link.href)
								? 'underline'
								: ''}  hidden sm:inline"
							class:italic={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
							class:opacity-70={data.role && !isAllowedOnPage(data.role, link.href, 'write')}
						>
							{link.label}
						</a>
					{/each}
				{/each}
			</nav>
		</div>
	</header>
{/if}
{#if navMenuOpen && !isLoginPage}
	<nav
		transition:slide
		class="bg-gray-400 text-gray-800 font-light flex flex-col sm:hidden border-x-0 border-b-0 border-opacity-25 border-t-1 border-white px-4 pb-3"
	>
		{#each adminLinks as adminLink}
			<span class="font-bold text-xl">
				{adminLink.section}
			</span>
			{#each adminLink.links as link}
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
