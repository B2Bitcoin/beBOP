<script>
	import OrderLabelComponent from '$lib/components/OrderLabelComponent.svelte';

	export let data;
</script>

<OrderLabelComponent orderLabel={data.label} class="text-sm" />
