<script lang="ts">
	export let data;
</script>

<a href="/admin/cms/new" class="underline block">Add CMS page</a>

<h1 class="text-3xl">List of CMS page</h1>

<ul>
	{#each data.cmsPages as cmsPage}
		<li>
			<a href="/admin/cms/{cmsPage._id}" class="underline text-blue">{cmsPage.title}</a>
		</li>
	{/each}
</ul>
