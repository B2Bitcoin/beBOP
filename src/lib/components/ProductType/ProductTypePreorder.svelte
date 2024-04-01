<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import IconDollar from '../icons/IconDollar.svelte';

	let className = '';
	export { className as class };

	const { t } = useI18n();

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span class="{baseClasses} {className} text-blue-500 bg-blue-200 whitespace-nowrap">
	<IconDollar />
	{t('product.type.preorder')}
</span>
