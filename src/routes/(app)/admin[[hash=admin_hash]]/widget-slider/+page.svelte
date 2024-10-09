<script lang="ts">
	export let data;
</script>

<a href="/admin/widget-slider/new" class="underline block">Add widget slider</a>

<h1 class="text-3xl">List of widgets slider</h1>

<div class="flex flex-row flex-wrap gap-6">
	<ul>
		{#each data.widgetSliders as widgetSlider}
			<li>
				{widgetSlider._id} -
				<a href="/admin/widget-slider/{widgetSlider._id}" class="underline body-hyperlink"
					>{widgetSlider.title}</a
				>
			</li>
		{:else}
			No widget slider yet
		{/each}
	</ul>
</div>
