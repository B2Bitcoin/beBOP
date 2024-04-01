<script lang="ts">
	import { useI18n } from '$lib/i18n';

	let className = '';
	export { className as class };

	const { t } = useI18n();

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span class="{baseClasses} {className} text-yellow-500 bg-yellow-100 whitespace-nowrap">
	{t('product.type.preview')}
</span>
