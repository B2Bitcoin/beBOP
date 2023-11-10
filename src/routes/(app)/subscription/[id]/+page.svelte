<script lang="ts">
	import ProductItem from '$lib/components/ProductItem.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { useI18n } from '$lib/i18n';

	const { t, i18n } = useI18n();

	export let data;
</script>

<main class="mx-auto max-w-7xl py-10 px-6 flex flex-col gap-4 items-start">
	<h1 class="text-3xl">
		{t('subscription.singleTitle', { number: data.subscription.number })}
	</h1>

	<ProductItem product={data.product} picture={data.picture} />

	<p>{t('subscription.associated.npub', { npub: data.subscription.npub })}</p>

	<p>
		<Trans key="subscription.initiallyCreated"
			><time datetime={data.subscription.createdAt.toJSON()}
				>{new Date(data.subscription.createdAt).toLocaleString(i18n.locale)}</time
			></Trans
		>
	</p>

	<p>
		<Trans key="subscription.paidUntil"
			><time datetime={data.subscription.paidUntil.toJSON()}
				>{new Date(data.subscription.paidUntil).toLocaleString(i18n.locale)}</time
			></Trans
		>
		{#if data.subscription.paidUntil < new Date()}
			<span class="text-red-500">({t('subscription.status.expired')})</span>
		{/if}
	</p>

	<form action="?/renew" method="post">
		<button
			class="btn btn-black"
			disabled={!data.canRenew}
			title={data.canRenew ? '' : t('subscription.cantRenew')}>{t('subscription.cta.renew')}</button
		>
	</form>
</main>
