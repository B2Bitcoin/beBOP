<script lang="ts">
	export let data;
</script>

<a href="{data.adminPrefix}/cms/new" class="underline block">Add CMS page</a>

<h1 class="text-3xl">List of CMS page</h1>

<p>
	To change the content of the home page, create a CMS page with "home" slug. The catalog will still
	be available <a href="/catalog" class="body-hyperlink underline">here</a>.
</p>

<ul>
	{#each data.cmsPages as cmsPage}
		<li>
			{cmsPage._id} -
			<a href="{data.adminPrefix}/cms/{cmsPage._id}" class="underline body-hyperlink"
				>{cmsPage.title}</a
			>
		</li>
	{/each}
</ul>
