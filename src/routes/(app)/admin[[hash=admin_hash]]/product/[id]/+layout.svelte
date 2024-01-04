<script lang="ts">
	import TabLinksHeader from '$lib/components/TabLinksHeader.svelte';

	export let data;
</script>

<!-- <h1 class="text-3xl">Edit a product</h1> -->
<TabLinksHeader
	tabs={[
		{ href: `${data.adminPrefix}/product/${data.product._id}`, name: 'Edit a product' },
		{ href: `${data.adminPrefix}/product/${data.product._id}/translations`, name: 'Translations' },
		...(data.product.type === 'subscription'
			? [
					{
						href: `${data.adminPrefix}/product/${data.product._id}/subscribers`,
						name: 'Subscribers'
					}
			  ]
			: [])
	]}
/>

<slot />
