<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import IconRotate from '../icons/IconRotate.svelte';

	let className = '';
	export { className as class };

	const { t } = useI18n();

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span class="{baseClasses} {className} text-jagger-700 bg-jagger-200 whitespace-nowrap">
	<IconRotate />
	{t('product.type.subscription')}
</span>
