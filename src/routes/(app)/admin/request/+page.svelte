<script>
	import { page } from '$app/stores';
</script>

<header class="text-gray-800 py-2 items-center flex">
	<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 grow overflow-hidden">
		<nav class="flex gap-6 font-light items-center">
			<a
				href="/return"
				class="{$page.url.pathname.startsWith('/return') ? 'underline' : ''} hidden sm:inline"
				>Return</a
			>
			<a
				href="/refund"
				class="{$page.url.pathname.startsWith('/refund') ? 'underline' : ''} hidden sm:inline"
				>Refund</a
			>
			<a
				href="/support"
				class="{$page.url.pathname.startsWith('/support') ? 'underline' : ''} hidden sm:inline"
				>Support</a
			>
		</nav>
	</div>
</header>
