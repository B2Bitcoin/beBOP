<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import IconBoxTaped from '../icons/IconBoxTaped.svelte';

	let className = '';
	export { className as class };

	const { t } = useI18n();

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span
	class="{baseClasses} {className} text-roseofsharon-700 bg-roseofsharon-200 whitespace-nowrap hidden"
>
	<IconBoxTaped />
	{t('product.type.physical')}
</span>
