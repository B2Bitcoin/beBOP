<script lang="ts">
	import { page } from '$app/stores';
</script>

<header class="bg-gray-400 text-gray-800 py-2 items-center flex">
	<div class="mx-auto max-w-7xl flex items-center gap-6 px-6 grow">
		<span class="font-bold text-xl">Admin</span>
		<nav class="flex gap-6 font-light items-center">
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
		</nav>
	</div>
</header>

<slot />
