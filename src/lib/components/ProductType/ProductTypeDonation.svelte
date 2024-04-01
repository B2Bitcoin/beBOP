<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import IconHandHeart from '../icons/IconHandHeart.svelte';

	let className = '';
	export { className as class };

	const { t } = useI18n();

	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span
	class="{baseClasses} {className} text-rosebudcherry-700 bg-rosebudcherry-200 whitespace-nowrap"
>
	<IconHandHeart />
	{t('product.type.donation')}
</span>
