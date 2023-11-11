<script lang="ts">
	import CmsPage from '$lib/components/CmsPage.svelte';

	export let data;
</script>

<CmsPage cmsPage={data.cmsPage} {...data.cmsData} />
