<script lang="ts">
	export let data;
</script>

<a href="/admin/cms/new" class="underline block">Add CMS page</a>

<h1 class="text-3xl">List of CMS page</h1>

<p>
	To change the content of the home page, create a CMS page with "home" slug. The catalog will still
	be available <a href="/catalog" class="text-blue underline">here</a>.
</p>

<ul>
	{#each data.cmsPages as cmsPage}
		<li>
			{cmsPage._id} -
			<a href="/admin/cms/{cmsPage._id}" class="underline text-blue">{cmsPage.title}</a>
		</li>
	{/each}
</ul>
