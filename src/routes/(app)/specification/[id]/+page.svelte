<script>
	import SpecificationWidget from '$lib/components/SpecificationWidget.svelte';

	export let data;
</script>

<SpecificationWidget specification={data.specification} />
