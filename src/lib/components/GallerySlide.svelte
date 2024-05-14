<script>
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if 1}
	<div transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}>
		slides in and out horizontally
	</div>
{/if}
