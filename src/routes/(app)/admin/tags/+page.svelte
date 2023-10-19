<script lang="ts">
	export let data;
</script>

<a href="/admin/tags/new" class="underline block">Create new tag</a>

<h1 class="text-3xl">List of Tags</h1>

<div class="flex flex-row flex-wrap gap-6">
	<ul>
		{#each data.tags as tag}
			<li>
				<a href={'/admin/tags/' + tag._id} class="underline text-blue">
					{tag.name}
				</a>
				- <span class="text-gray-550">[tag={tag._id}]</span>
			</li>
		{:else}
			No tags yet
		{/each}
	</ul>
</div>
