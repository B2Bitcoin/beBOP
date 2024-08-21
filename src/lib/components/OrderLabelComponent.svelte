<script lang="ts">
	import type { OrderLabel } from '$lib/types/OrderLabel';

	export let orderLabel: OrderLabel;
	let className = '';
	export { className as class };
	$: baseClasses =
		'pl-1 pr-3 flex gap-2 items-center uppercase ' +
		(className.includes('rounded') ? '' : 'rounded-full');
</script>

<span
	class="{baseClasses} {className}  whitespace-nowrap"
	style="color: {orderLabel.color}; border:1px solid {orderLabel.color}"
>
	{orderLabel.icon}
	{orderLabel.name}
</span>
