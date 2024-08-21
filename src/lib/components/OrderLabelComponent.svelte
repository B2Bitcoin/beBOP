<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import type { OrderLabel } from '$lib/types/OrderLabel';

	export let orderLabel: OrderLabel;
	let className = '';
	export { className as class };
	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span class="{baseClasses} {className} text-blue-500 bg-blue-200 whitespace-nowrap">
	{orderLabel.icon}
	{orderLabel.name}
</span>
