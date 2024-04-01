<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import IconDownTo from '../icons/IconDownTo.svelte';

	let className = '';
	export { className as class };

	const { t } = useI18n();

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span class="{baseClasses} {className} text-green-700 bg-green-200 whitespace-nowrap">
	<IconDownTo />
	{t('product.type.digitalResource')}
</span>
