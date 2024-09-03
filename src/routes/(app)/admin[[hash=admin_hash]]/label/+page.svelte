<script lang="ts">
	export let data;
</script>

<a href="{data.adminPrefix}/label/new" class="underline block">Add a label</a>

<h1 class="text-3xl">List of Label</h1>

<ul>
	{#each data.labels as label}
		<li>
			{label._id} -
			<a href="{data.adminPrefix}/label/{label._id}" class="underline body-hyperlink"
				>{label.name}</a
			>
		</li>
	{:else}
		No label yet
	{/each}
</ul>
