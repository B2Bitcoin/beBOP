<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import IconQRCode from '~icons/ant-design/qrcode-outlined';

	let className = '';
	export { className as class };

	const { t } = useI18n();

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span class="{baseClasses} {className} text-roseofsharon-700 bg-roseofsharon-200 whitespace-nowrap">
	<IconQRCode />
	{t('product.type.ticket')}
</span>
